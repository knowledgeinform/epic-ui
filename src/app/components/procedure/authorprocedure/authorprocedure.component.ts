import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatTabGroup} from '@angular/material/tabs'
import {EPICWSService} from '@app/services/epic-ws.service';
import {Subscription} from 'rxjs';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {LoginService} from '@app/services/login.service';
import {RunStartDialogComponent} from '../../run/run-start-dialog/run-start-dialog.component';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';
import {OfflineService} from '@app/services/offline.service';
import { ProcedureRevisionService } from '@app/services/procedure-revision.service';
import { ProcedureDef } from '@app/interfaces/procedure-def.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { ExportService } from '@app/services/export.service';
import {LoggerService} from '@app/services/logger.service';
import {ApproverStatusService} from "@app/services/approver-status.service";
import { AppService } from '@app/services/app.service';


@Component({
  selector: 'app-authorprocedure',
  host: { class: 'flex-row' },
  templateUrl: './authorprocedure.component.html',
  styleUrls: ['./authorprocedure.component.css']
})
export class AuthorprocedureComponent implements OnInit, OnDestroy {

  public ProcedureStatus = ProcedureStatus;
  public tabSelectionIndex: number = 0;

  isLockedFromEditing = true;
  fetchIsDone = false;
  fetchError: string = null;
  commentsWindowOpen: boolean; // controls if the nav panel is open or not

  procedureData: ProcedureDetails;
  procedureDef: ProcedureDef;
  public isLatestRevision: boolean;
  public isLatestReleasedRevision: boolean;

  procedureId: any;
  routeParamSubscription: Subscription;

  public expandSteps: boolean;  // Stores whether steps should be expanded or collapsed
  public viewNav: boolean;  // Stores whether navigation panel should be displayed
  public expandInstructions: boolean; // Stores whether instructions should be expanded or collapsed
  subscription: Subscription;

  constructor(private route: ActivatedRoute,
              protected router: Router,
              private dialog: MatDialog,
              public appService: AppService,
              public epicService: EPICWSService,
              private offlineService: OfflineService,
              public procedureRevisionService: ProcedureRevisionService,
              private exportService: ExportService,
              public jwtService: LoginService,
              private loggerService: LoggerService,
              private approverStatusService: ApproverStatusService) {

    this.subscription = approverStatusService.approverStatusChanged.subscribe(
    procedureData => {
          this.procedureData = procedureData;
    });
  }

  ngOnInit() {
    this.routeParamSubscription = this.route.params.subscribe(params => {
      this.tabSelectionIndex = !params.tab ? 0 : Number(params.tab);
      const procId = params?.id;
      if ( procId === undefined || procId === null) {
        this.loggerService.error('Invalid procedure ID in route. Redirecting to dashboard.');
        this.router.navigate(['/dashboard']);
        return;
      }
      this.procedureId = params.id;  
      if (this.procedureId === this.procedureData?.id) return;
      
      this.fetchIsDone = false;

      this.loggerService.info('Retrieving procedure with id ' + this.procedureId);
      this.epicService.getProcedureDetailsByUniqueCode(this.procedureId).subscribe((data) => {
        if (data.error) {
          this.fetchError = data.error;
          this.appService.announceBrowserTitleChange('[' + this.procedureId + '] ');
          this.appService.announcePageTitleChange(this.procedureId);
          this.loggerService.error('Could not retrieve procedure with id ' + this.procedureId + ' from server: ' + this.fetchError);
          this.fetchIsDone = true;
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error retrieving procedure from the server',
              errorMessage: this.fetchError,
            },
          });

        } else {
          this.procedureData = data;
          this.appService.announceBrowserTitleChange('[' + data.id + '] ' + data.procedureDef.name);
          this.appService.announcePageTitleChange(data.id + ' - ' + data.procedureDef.name);

          this.epicService.getProcedureDefByPk(this.procedureData.procedureDef.pk).subscribe( pDef => {
            this.procedureDef = pDef;
            this.isLatestRevision = this.procedureRevisionService.checkIsLatestRevision(this.procedureData, this.procedureDef);
            this.isLatestReleasedRevision = this.procedureRevisionService.checkIsLatestReleasedRevision(this.procedureData.procedureDefVersion, this.procedureDef);
            this.fetchIsDone = true;
          });
        }
      });
    });
  }

  public onSelectionChange(): void {
    this.navigateToSelection(this.procedureId, this.tabSelectionIndex);
  }

  private navigateToSelection(procedureId: string, tabSelectionIndex: number) {
    this.router.navigate(['/procedure', procedureId, tabSelectionIndex]);
  }

  toggleApprovalComments(event): void {
    this.commentsWindowOpen = !this.commentsWindowOpen;
  }

  ngOnDestroy() {
    this.routeParamSubscription.unsubscribe();
  }

  openRunStart(procedureDetailsPk: number): void {
    this.dialog.open(RunStartDialogComponent, {
      width: '800px',
      disableClose: true,
      data: {
        selectedProcedureDetailsPk: procedureDetailsPk,
        searchForProcedure: false
      }
    });
  }

  public exportRuns() {
    this.exportService.downloadProcedureExport(this.procedureId);
  }
}
