import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoginService} from '@app/services/login.service';
import {EPICWSService} from '@app/services/epic-ws.service';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {MatDialog} from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogModel
} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import {Run} from '@app/interfaces/Run';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MessageService} from '@app/services/message.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-approver-action',
  templateUrl: './approver-action.component.html',
  styleUrls: ['./approver-action.component.css']
})

export class ApproverActionComponent {

  @Input() approval: ProcedureApproval | RunApproval;
  @Output() approvalChange = new EventEmitter<ProcedureApproval>();
  @Input() isReadonly: boolean = false;
  @Output() runChange = new EventEmitter<Run>();
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();


  constructor(private jwtService: LoginService,
              private epicService: EPICWSService,
              private dialog: MatDialog,
              private messageService: MessageService,
              private loggerService: LoggerService) { }



  public onButtonClick(selectedValue: boolean) {
    const currentIsApprovedValue = this.approval.isApproved;
    this.approval.isApproved = (this.approval.isApproved === selectedValue) ? null : selectedValue;

    // Update approver on server, but first request confirmation if they're unsetting their approval state.
    const p: Promise<boolean> = (this.approval.isApproved === null)
      ? this.dialog.open(ConfirmationDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmationDialogModel('Confirm Removal of Approval Decision', 'Please confirm that you wish to remove ' +
        'your approval decision.'),
        disableClose: true,
      }).afterClosed().toPromise()
      : Promise.resolve(true);

    p.then(confirmed => {
      if (confirmed === false) return;

      if (this.approval['dueDate'] === undefined) {
        this.loggerService.info('Saving approval decision for procedure approval with pk ' + this.approval.pk);
        this.epicService.setApproved(this.approval.isApproved, this.approval.pk).subscribe((data) => {
          if (data != null && !data.error) {
            this.approval = data.approval;
            this.approvalChange.emit(this.approval);
            this.procedureDataChange.emit(new ProcedureDetails().loadFromDTO(data.procedureDetails));
            this.displayStatusMessage('procedure');
          } else {
            this.handleError(currentIsApprovedValue, data?.error);
          }
        });
      } else if (this.approval['dueDate']) {
        this.loggerService.info('Saving approval decision for run closeout approval with pk ' + this.approval.pk);
        this.epicService.submitRunApprovalDecision(this.approval as RunApproval).subscribe((updatedRun) => {
          if (!updatedRun.error) {
            this.runChange.emit(updatedRun);
            this.displayStatusMessage('run close-out');
          } else {
            this.handleError(currentIsApprovedValue, updatedRun.error);
          }
        });
      }
    });
  }

  private displayStatusMessage(typeOfApprovalString: string): void {
    if (this.approval.isApproved === null) {
      this.messageService.showSnackBar('You have removed your approval decision', 'CLOSE');
    } else {
      this.messageService.showSnackBar('You have ' + (this.approval.isApproved ? 'approved' : 'rejected') + ' this ' + typeOfApprovalString, 'CLOSE');
    }
  }

  private handleError(originalApprovalValue: boolean, errorMessage: string): void {
    // return the approval to its original value and put up an error dialog
    this.approval.isApproved = originalApprovalValue;
    this.loggerService.error('Error while saving approval decision: ' + errorMessage);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error while saving approval decision',
        errorMessage: errorMessage
      }
    });
  }
}
