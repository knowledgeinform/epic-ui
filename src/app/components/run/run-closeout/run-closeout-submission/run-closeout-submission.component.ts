import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Run} from '@app/interfaces/Run';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';
import {
  AutocompleteDialogBinder,
  SingleAutocompleteDialogComponent
} from '@app/components/single-autocomplete-dialog/single-autocomplete-dialog.component';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import {ConfirmationDialogComponent} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Router} from '@angular/router';
import {ApprovalType} from '@app/interfaces/approval';
import {LoginService} from '@app/services/login.service';
import {RunCloseoutStickyReportingService} from '@app/services/run-closeout-sticky-reporting.service';
import {RunStatus} from '@app/interfaces/run-status.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

interface User {
  userId: number;
}

@Component({
  selector: 'app-run-closeout-submission',
  templateUrl: './run-closeout-submission.component.html',
  styleUrls: ['./run-closeout-submission.component.css']
})
export class RunCloseoutSubmissionComponent implements OnInit, OnChanges {

  procedureData: ProcedureDetails;
  @Input() run: Run;
  @Input() validationErrors: any;
  @Input() isReadonly: boolean;
  savingApprover: boolean = false;
  submittingRun: boolean = false;
  @Output() reload = new EventEmitter<Run>();

  constructor(public epicService: EPICWSService,
              public messageService: MessageService,
              public dialog: MatDialog,
              private router: Router,
              public jwtService: LoginService,
              private stickyReportingService: RunCloseoutStickyReportingService,
              private loggerService: LoggerService) { }

  ngOnInit() {
    this.procedureData = this.run.procedureDetails;
    if (this.run.runApprovals === null || this.run.runApprovals === undefined) {
      this.run.runApprovals = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'run': {
            this.procedureData = this.run.procedureDetails;
            return;
          }
        }
      }
    }
  }

  get canAddChangeDeleteApprovers(): boolean {
    if (this.isReadonly) return false;
    return this.jwtService.getCurrentUser().isAdmin || !this.run.closeoutSubmissionUser ||
      (this.run.closeoutSubmissionUser.displayName === this.jwtService.getCurrentUser().displayName);
  }

  addApprover(): void {
    const validator: AutocompleteDialogBinder<User> = {
      title: 'Add Approver',
      instructions: '',
      placeholder: 'Name or 521',
      autocompleteSource: this.epicService.getMatchingUsers,
      autocompleteDisplay: (user?: any): string | undefined => user ? user.displayName : undefined,
      validateSelection: (approver) =>
        (typeof approver === 'string') ? 'Not Found' :
          this.run.runApprovals.find(a => a.approvalType === 'APPROVER' && a.users.userId === approver.userId) === undefined ?
            null : 'Already an approver',
    };

    const dialogRef = this.dialog.open(SingleAutocompleteDialogComponent, {
      width: '300px',
      data: {validator: validator},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addApproval(result.userId, ApprovalType.APPROVER);
      }
    });
  }

  addApproval(userId: number, approvalType: ApprovalType): void {
    this.savingApprover = true;
    this.loggerService.info('Adding user ' + userId + ' as a run closeout approver for procedure details with pk ' + this.procedureData.pk);
    this.epicService.saveRunApprover(userId, approvalType, this.run.pk, this.run.runApprovals.length + 1).subscribe((runApproval) => {
      this.savingApprover = false;
      if (!runApproval.error) {
        this.run.runApprovals.push(runApproval);
        this.messageService.showSnackBar('Run close-out approver saved', 'CLOSE');
      } else {
        this.showErrorDialog(runApproval.error);
      }
    });
  }

  public canRemoveApprover(approval: RunApproval): boolean {
    return _.isEmpty(approval.comments) && this.canAddChangeDeleteApprovers;
  }

  public getApproverChipTooltipText(approval: RunApproval) {
    return `This user has ${approval.isApproved ? '' : 'not'} approved and has ${_.get(approval, 'comments.length', 0)} comments.`;
  }

  removeApproval(approval: RunApproval) {
    if (!_.isEmpty(approval.comments)) {
      this.loggerService.warn('Attempt to remove run closeout approval with pk ' + approval.pk + ' failed because there were comments');
      this.messageService.showSnackBar('Cannot delete approver because they have submitted comments.', 'CLOSE');
    }
    this.savingApprover = true;
    this.loggerService.info('Removing the run closeout approval with pk ' + approval.pk);
    this.epicService.deleteRunApprover(approval.pk).subscribe((updatedApprovals) => {
      this.savingApprover = false;
      if (!updatedApprovals.error) {
        this.run.runApprovals = updatedApprovals;
        this.messageService.showSnackBar('Run close-out approver deleted', 'CLOSE');
      } else {
        this.showErrorDialog(updatedApprovals.error);
      }
    });
  }

  updateApproverDueDate(approval: RunApproval, dueDate: any): void {
    this.savingApprover = true;
    approval.dueDate = new Date(dueDate);
    this.loggerService.info('Updating the due date for run closeout approval with pk ' + approval.pk + '; dueDate=' + dueDate);
    this.epicService.updateRunApprovers(this.run.pk, [approval]).subscribe((updatedApprovals) => {
      this.savingApprover = false;
      if (!updatedApprovals.error) {
        const indexOfApproval = this.run.runApprovals.findIndex(r => r.pk === updatedApprovals[0].pk);
        this.run.runApprovals.splice(indexOfApproval, updatedApprovals.length, ...updatedApprovals);
        this.messageService.showSnackBar('Run close-out approver\'s due date updated', 'CLOSE');
      } else {
        this.showErrorDialog(updatedApprovals.error);
      }
    });
  }

  showErrorDialog(message: string): void {
    this.loggerService.error('There was an error while changing run closeout approvers or submitting the run for closeout: ' + message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error while updating run close-out approver display',
        errorMessage: message
      }
    });
  }

  dropApprover(event: CdkDragDrop<any>): void {
    moveItemInArray(this.run.runApprovals, event.previousIndex, event.currentIndex);
    const approvalsToUpdate = [];
    const minIndex = Math.min(event.previousIndex, event.currentIndex);
    const maxIndex = Math.max(event.previousIndex, event.currentIndex);
    for (let i = minIndex; i <= maxIndex; i++) {
      this.run.runApprovals[i].approverOrder = i + 1;
      approvalsToUpdate.push(this.run.runApprovals[i]);
    }
    this.loggerService.info('Saving reordering of run closeout approvers; moved run approval with pk ' + this.run.runApprovals[event.currentIndex].pk);
    this.epicService.updateRunApprovers(this.run.pk, approvalsToUpdate).subscribe((updatedApprovals) => {
      if (!updatedApprovals.error) {
        this.run.runApprovals.splice(minIndex, updatedApprovals.length, ...updatedApprovals);
        this.messageService.showSnackBar('Updated approver ordering', 'CLOSE');
      } else {
        this.showErrorDialog(updatedApprovals.error);
      }
    });
  }

  get allApproversHaveDueDates(): boolean {
    if (_.isEmpty(this.run.runApprovals)) return true;
    const result = _.some(this.run.runApprovals, function(approver) {
      return !approver.dueDate;
    });
    return !result;
  }

  submitRunAndTransitionToReviewing(): void {
    if (this.run.status === RunStatus.CORRECTING && this.stickyReportingService.totalCountOfStickiesInProcedure[this.procedureData.pk] > 0) {
      this.loggerService.warn('Attempted to transition a run from correcting to reviewing while run closeout stickies remained');
      this.showErrorDialog('You cannot submit this run for closeout while unresolved closeout stickies remain. Resolve the remaining stickies then re-submit.');
      return;
    }
    this.submittingRun = true;
    if (_.isEmpty(this.run.runApprovals)) {
      this.loggerService.warn('Submitting without run closeout approvers for run with pk ' + this.run.pk);
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '550px',
        minHeight: '200px',
        disableClose: true,
        data: {
          title: 'Confirm No Approvers Selected',
          message: 'You have not selected an approver for this run. Are you sure you want to submit it for closeout?'
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.checkValidation();
        } else {
          this.submittingRun = false;
        }
      });
    } else {
      this.checkValidation();
    }
  }

  private checkValidation(): void {
    if (!_.isEmpty(this.validationErrors)) {
      this.loggerService.warn('Submitting with validation errors for run with pk ' + this.run.pk);
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '550px',
        minHeight: '200px',
        disableClose: true,
        data: {
          title: 'Confirm Submission With Validation Errors',
          message: 'This run has validation errors such as missing values or missing witness/mandatory inspection signatures. ' +
            'Are you sure you want to submit this run for closeout?'
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.transitionToReviewing();
        } else {
          this.submittingRun = false;
        }
      });
    } else {
      this.transitionToReviewing();
    }
  }

  private transitionToReviewing(): void {
    // if here, there are approvers and no validation errors, or user has elected to submit for closeout anyway.
    this.loggerService.info('Transitioning to reviewing status for run with pk ' + this.run.pk);
    this.epicService.submitRunForCloseoutAndTransitionToReviewing(this.run.pk).subscribe((updatedRun) => {
      this.submittingRun = false;
      if (!updatedRun.error) {
        this.run = updatedRun;
        this.messageService.showSnackBar('Run has been transitioned to Review status. Locking into read-only mode.', 'CLOSE');
        this.reload.emit(this.run);
      } else {
        this.showErrorDialog(updatedRun.error);
      }
    });
  }
}
