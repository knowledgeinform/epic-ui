import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EPICWSService } from '@app/services/epic-ws.service';
import { Subscription } from 'rxjs';
import { AppComponent } from '../../app/app.component';
import { LoginService } from '@app/services/login.service';
import * as _ from 'lodash';
import { Run } from '@app/interfaces/Run';
import { MessageService } from '@app/services/message.service';
import { EditType } from '@app/interfaces/edit-type.dto';
import { ProcedureDef } from '@app/interfaces/procedure-def.dto';
import { ProcedureRevisionService } from '@app/services/procedure-revision.service';
import { RunValidationService } from '@app/services/run-validation.service';
import { RunNonconformanceService } from '@app/services/run-nonconformance.service';
import { LineEditReportingService } from '@app/services/line-edit-reporting.service';
import { RunCloseoutStickyReportingService } from '@app/services/run-closeout-sticky-reporting.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { LoggerService } from '@app/services/logger.service';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { AttachmentType } from '@app/interfaces/attachment-type.enum';
import { LineEditService } from '@app/services/line-edit.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';

@Directive()
export class ProcedureRunCommonComponent implements OnInit, OnDestroy {

  public fetchIsDone = false;
  protected fetchError: string = null;

  public run: Run;
  public runId: string;

  public procedureData: ProcedureDetails;
  public procedureDef: ProcedureDef;
  public isLatestRevision: boolean;

  public EditType = EditType;
  public AttachmentType = AttachmentType;

  protected subscriptions: Subscription[] = [];

  public selectionIndex: number;
  public selectionIndexForStepsPage: number = 4;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected dialog: MatDialog,
    public app: AppComponent,
    public epicService: EPICWSService,
    public jwtService: LoginService,
    public runValidationService: RunValidationService,
    public procedureRevisionService: ProcedureRevisionService,
    public messageService: MessageService,
    public runNonconformanceService: RunNonconformanceService,
    public redLineReportingService: LineEditReportingService,
    public stickyReportingService: RunCloseoutStickyReportingService,
    protected loggerService: LoggerService,
    public lineEditService: LineEditService,
    protected lineEditStateService: LineEditStateService) {
    this.routeEvent(this.router);
    this.updateProcedureDataLineEdits();

  }

  routeEvent(router: Router) {
    this.subscriptions.push(router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.setTitles();
      }
    }));
  }

  updateProcedureDataLineEdits(): void {
    this.subscriptions.push(this.lineEditService.blackLineEditChanged.subscribe(blackLine => {
      if (!this.procedureData) {
        return;
      }

      this.lineEditStateService.applySavedBlackLine(this.procedureData, blackLine);
      this.lineEditStateService.rebuildLineEditReporting(this.procedureData);
    }));
  }

  ngOnInit() {
    const routeSub = this.route.params.subscribe(params => {
      // Only load data if the specified run has not been loaded yet.
      if (!this.run || this.runId !== params.id) {
        this.loadPageData(params);
      }

    });
    this.subscriptions.push(routeSub);
  }

  private setTitles() {
    if (this.run) {
      this.app.setTitle(`[${this.runId}] - ${this.run.name}`);
      this.app.setPageTitle(`${this.runId} - ${this.run.name}`);
    }
  }
  protected refreshRunData(): void {
    if (!this.runId) return;

    this.epicService.getRun(this.runId).subscribe(run => {
      if (!run || run.error) {
        this.loggerService.warn('Refresh run failed: ' + (run?.error ?? 'Unknown error'));
        return;
      }

      this.run = run;
      this.procedureData = run.procedureDetails;

      // rebuild all derived stores after replacing procedureData reference
      this.redLineReportingService.findAllLineEdits(this.procedureData);
      this.stickyReportingService.findAllStickyComments(this.procedureData);
    });
  }

  protected loadPageData(params: Params) {
    const procId = params?.id;
    if (procId === undefined || procId === null) {
      this.loggerService.error('No procedure ID found in route parameters.');
      return;
    }
    this.runId = params.id;

    // Get runs:
    this.loggerService.info('Retrieving run with procedure details id: ' + this.runId);
    this.epicService.getRun(this.runId).subscribe(run => {
      if (!run || run.error) {
        this.loggerService.error('Could not retrieve run with procedure details id: ' + this.runId + '; ' + run.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error retrieving run',
            errorMessage: run.error
          }
        });
        return;
      }
      this.run = run;

      this.procedureData = this.run.procedureDetails;
      this.fetchIsDone = true;

      this.setTitles();

      this.procedureData.redliningEnabled = false;
      this.checkIfRedLiningAllowed();

      this.runValidationService.validateProcedure(this.procedureData);

      this.epicService.getProcedureDefByPk(this.procedureData.procedureDef.pk).subscribe(pDef => {
        this.procedureDef = pDef;
        this.isLatestRevision = this.procedureRevisionService.checkIsLatestRevision(this.procedureData, this.procedureDef);
      });

      this.runNonconformanceService.findNonConformancesInProcedure(this.run);
      this.redLineReportingService.findAllLineEdits(this.procedureData);
      this.stickyReportingService.findAllStickyComments(this.procedureData);
    });
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  checkIfRedLiningAllowed() {
    this.epicService.checkIfRedLineAllowed(this.runId).subscribe(data => {
      if (!data) {
        this.procedureData.redliningEnabled = false;
        this.procedureData.editType = EditType.LOCKED_RUN;
        this.loggerService.info('Run with procedure details id ' + this.runId + ' is locked from redlining');
        this.messageService.showSnackBar('This run cannot be red lined; there are already red lines on another run ' +
          ' for this procedure revision.', 'CLOSE', 10000);
      }
    });
  }

  public onRunChange(run: Run) {
    _.assign(this.run, run);
    _.assign(this.procedureData, run.procedureDetails);
  }
}
