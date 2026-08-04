import {Component, Input} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent, ConfirmationDialogModel} from '../../confirmation-dialog/confirmation-dialog.component';
import {LoggerService} from '@app/services/logger.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

@Component({
  selector: 'app-procedure-transition-release',
  templateUrl: './procedure-transition-release.component.html',
  styleUrls: ['./procedure-transition-release.component.css']
})
export class ProcedureTransitionReleaseComponent {
  @Input() procedureData:ProcedureDetails;
  constructor(private router: Router,
              private epicService: EPICWSService,
              public dialog: MatDialog,
              private loggerService: LoggerService) {
  }
  get approvers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'APPROVER');
  }

  returnToDraft(): void {
    const dialogData = new ConfirmationDialogModel('Are you sure?', 'Returning to DRAFT will reset all approval decisions');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.loggerService.info('Transitioning procedure with pk ' + this.procedureData.pk + ' back to draft status');
        this.epicService.transitionProcToDraft(this.procedureData.pk).subscribe((data) => {
          if (!data.error) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
              this.router.navigate(['procedure', data.id]));
          } else {
            this.loggerService.error('Could not transition back to draft status for procedure with pk ' + this.procedureData.pk + '; ' + data.error);
            this.dialog.open(ErrorDialogComponent, {
              data: {
                description: 'Error transitioning procedure to Draft status',
                errorMessage: data.error
              }
            });
          }
        });
      }
    });
  }

  get isReadyForRelease() {
    for (let approver of this.approvers) {
      if (!approver.approverDisabled && (approver.isApproved === null || approver.isApproved === false)) {
        return false;
      }
    }
    return true;
  }

  readyForRelease(): void {
    const dialogData = new ConfirmationDialogModel('Are you sure?', 'Releasing this procedure will allow it to be used for runs. Editing will only be allowed via red/black line changes and creating a new version release.');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.epicService.transitionProcToReady(this.procedureData.pk).subscribe((data) => {
          if (!data.error) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then( () =>
              this.router.navigate(['procedure', data.id]));
          }
        });
      }
    });
  }

}
