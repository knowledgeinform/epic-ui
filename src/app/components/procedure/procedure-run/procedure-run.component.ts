import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {AppComponent} from '../../app/app.component';
import {LoginService} from '@app/services/login.service';
import {ProcedureRunCommonComponent} from './procedure-run-common.component';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {OfflineService} from '@app/services/offline.service';
import {ProcedureRevisionService} from '@app/services/procedure-revision.service';
import {ProcedureDef} from '@app/interfaces/procedure-def.dto';
import {RunValidationService} from '@app/services/run-validation.service';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {RunNonconformanceService} from '@app/services/run-nonconformance.service';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {BlackLineDto, BlackLineEntityType} from '@app/interfaces/black-line.dto';
import {RunCloseoutStickyReportingService} from '@app/services/run-closeout-sticky-reporting.service';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {ExportService} from '@app/services/export.service';
import { RosterService } from '@app/services/roster.service';
import {LoggerService} from '@app/services/logger.service';
import { RedBlackLineComment } from '@app/interfaces/comment.dto';
import { LayoutBreakpointService } from '@app/services/layout-breakpoint.service';
import { BulkValidateDialogComponent } from '@app/components/bulk-validate-dialog/bulk-validate-dialog.component';
import {StepCloneDialogComponent} from "@app/components/step/step-clone-dialog/step-clone-dialog.component";
import { LineEditService } from '@app/services/line-edit.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';

@Component({
  selector: 'app-procedure-run',
  host: { class: 'flex-row' },
  templateUrl: './procedure-run.component.html',
  styleUrls: ['./procedure-run.component.scss']
})
export class ProcedureRunComponent extends ProcedureRunCommonComponent implements OnInit, OnDestroy {
  public commentsWindowOpen: boolean; // controls if the nav panel is open or not
  // public blackCommentsOn: boolean = false;
  // public redCommentsOn: boolean = false;
  public  selectionIndex: number;
  public enableBlackLining: boolean = false;
  public readOnly: boolean = true;
  public initialReadOnlyValue: boolean; // Used to restore readOnly value when offline status reverts.
  public procedureDef: ProcedureDef;
  public RunStatus = RunStatus;
  public expandInstructions: boolean; // Used to store whether instructions should be expanded or collapsed
  public expandSteps: boolean;  // Used to store whether steps should be expanded or collapsed
  public viewNav: boolean;  // Used to store whether the navigation panel should be displayed or not

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected dialog: MatDialog,
    public app: AppComponent,
    public epicService: EPICWSService,
    public jwtService: LoginService,
    public messageService: MessageService,
    public runValidationService: RunValidationService,
    public runNonconformanceService: RunNonconformanceService,
    public lineEditReportingService: LineEditReportingService,
    public procedureRevisionService: ProcedureRevisionService,
    public stickyReportingService: RunCloseoutStickyReportingService,
    public offlineService: OfflineService,
    private exportService: ExportService,
    protected rosterService: RosterService,
    protected loggerService: LoggerService,
    public lineEditService: LineEditService,
    protected lineEditStateService: LineEditStateService,
    public readonly media: LayoutBreakpointService,
  ) {
    super(router, route, dialog, app, epicService, jwtService, runValidationService, procedureRevisionService, messageService,
      runNonconformanceService, lineEditReportingService, stickyReportingService, loggerService, lineEditService, lineEditStateService);
  }

  ngOnInit() {
    super.ngOnInit();
    const routeSub = this.route.params.subscribe(params => {
          this.selectionIndex = params.tab === undefined ? 0 : Number(params.tab);
    });
    this.subscriptions.push(routeSub);

    // Go read-only when offline. Revert after.
    const offlineSub = this.offlineService.offlineSubject.subscribe(isOffline => {
      if (isOffline) {
        this.loggerService.info('Run is being accessed while offline; in readonly mode');
        this.initialReadOnlyValue = this.readOnly;
        this.readOnly = true;
      } else {
        this.readOnly = this.initialReadOnlyValue;
        this.initialReadOnlyValue = null;
      }
    });
    this.subscriptions.push(offlineSub);
  }

  public onSelectionChange(): void {
    this.navigateToSelection(this.runId, this.selectionIndex);
  }

  private navigateToSelection(runId: string, selectionId: number) {
    this.router.navigate(['/run', runId, selectionId]);
  }

  public redAndBlackLiningOffline(): boolean {
    if (this.offlineService.offline) {
      this.enableBlackLining = false;
      this.procedureData.redliningEnabled = false;
    }
    return this.offlineService.offline;
  }

  public toggleRedLineEditMode = () => {
    if (!this.procedureData) return;
    const enabled = this.procedureData.redliningEnabled;
    if (enabled) {
      this.checkIfRedLiningAllowed();
    }
    this.procedureData.redliningEnabled = !enabled;
    this.readOnly = !this.procedureData.redliningEnabled;
  }

  public createProcedureLevelBlackLine = () => {
    // open a dialog
    const dialogRef = this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.BLACK_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
    dialogRef.afterClosed().subscribe((blackLineComment: RedBlackLineComment) => {
      if (blackLineComment === null) {
        this.messageService.showSnackBar('Black Line Cancelled by User', 'CLOSE');
        return;
      }

      // create the black line object and set the fields.
      // TODO: Move this code to the service.
      const blackLine: BlackLineDto = {
        blackRedLineSignatures: blackLineComment.blackRedLineSignatures,
        commentText: blackLineComment.commentText,
        commentTimestamp: new Date(),
        commentType: blackLineComment.commentType,
        pk: null,
        procedureChangeType: blackLineComment.procedureChangeType,
        procedureDetails: {
          pk: this.procedureData.pk,
        } as ProcedureDetailsDTO,
        procedureInstruction: null,
        stepDef: null,
        stepGroupDef: null,
        users: null,
      };
      let entityType = BlackLineEntityType.PROCEDURE_DETAILS;

      // call the service to save
      this.loggerService.info('Saving run level black line for run procedureDetails with pk ' + this.procedureData.pk, blackLine);
      this.epicService.saveNewBlackLines([blackLine], entityType, false).subscribe((newBlackLine) => {
        this.fetchIsDone = true;
        if (newBlackLine.errorMessage) {
          this.loggerService.error('Could not save run level black line; ' + newBlackLine.errorMessage);
          this.messageService.showSnackBar('Could not save the run level black line: ' + newBlackLine.errorMessage, 'CLOSE');
        } else {
          const enrichedBlackLines = this.lineEditStateService.enrichSavedBlackLines(newBlackLine, [blackLine]);
          // call the line edit service to announce the black line to subscribers.
          this.lineEditService.announceBlackLineChanges(enrichedBlackLines);
          this.loggerService.info('Black line saved');
          this.messageService.showSnackBar('Black Line Saved', 'CLOSE');
        }
      });
    });
  }

  updateProcedureData(procedureData: ProcedureDetails): void {
    this.run = procedureData.run;
    this.run.procedureDetails = procedureData;
    this.procedureData = procedureData;
  }

  public refreshValues = () => {
    this.loggerService.info('Data refresh clicked, getting information from the server for run procedure details with pk ' + this.procedureData.pk);
    this.messageService.showSnackBar('Retrieving updated information from the server...', 'CLOSE');
    this.epicService.getRun(this.runId).subscribe(runOnServer => {
      // TODO: Figure out a solution to EPIC-718. May require web sockets or concurrent editing?
      // _.merge(runOnServer, this.run); // take the current run which should be newer than the server one.
      this.run = runOnServer;
      this.procedureData = this.run.procedureDetails;
      this.runValidationService.validateProcedure(this.procedureData);
      this.runNonconformanceService.findNonConformancesInProcedure(this.run);
      this.lineEditReportingService.findAllLineEdits(this.procedureData);
      this.stickyReportingService.findAllStickyComments(this.procedureData);

      if (RunStatus[this.run.status] === RunStatus.REVIEWING || this.run.status === RunStatus.APPROVED || this.run.status === RunStatus.COMPLETED) {
        this.readOnly = true;
      }
    });
  }

  public exportRun = () => {
    this.exportService.downloadProcedureExport(this.procedureData.id);
  }

  public toggleReadOnly =  () => {
    this.epicService.getRun(this.runId).subscribe(runOnServer => {
      this.run = runOnServer;
      this.procedureData = this.run.procedureDetails;
      this.readOnly = !this.readOnly;
      if (this.readOnly) this.procedureData.redliningEnabled = false;
    });
  }

  public createRevision = () => {
    this.procedureRevisionService.createRevision(this.procedureData as any, this.procedureDef);
  }

  public toggleRunApprovalComments = () => {
    this.commentsWindowOpen = !this.commentsWindowOpen;
  }

  public print = () => {
    this.router.navigate(['/print/run', this.runId]);
  }

  openBulkValidateDialog(event): void {
    this.dialog.open(BulkValidateDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        redliningEnabled: this.procedureData.redliningEnabled,
        showNotValidatedOnly: true,
        redBlackLineComments: false,
      }
    });
  }

  @HostListener('window:keyup.F8') onF8KeyUp() {
    this.refreshValues();
  }
}
