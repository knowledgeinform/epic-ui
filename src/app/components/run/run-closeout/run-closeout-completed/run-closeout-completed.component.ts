import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Run} from '@app/interfaces/Run';
import {LoginService} from '@app/services/login.service';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-run-closeout-completed',
  templateUrl: './run-closeout-completed.component.html',
  styleUrls: ['./run-closeout-completed.component.css']
})
export class RunCloseoutCompletedComponent {

  @Input() run: Run;
  public RunStatus = RunStatus;
  @Output() reload = new EventEmitter<Run>();
  transitioningRun: boolean = false;

  constructor(
    public jwtService: LoginService,
    private epicService: EPICWSService,
    public dialog: MatDialog,
    private loggerService: LoggerService
  ) { }



  transitionToCorrectingStatus(): void {
    this.transitioningRun = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        title: 'Confirm Re-Opening This Run',
        message: 'As an EPIC Admin, you are choosing to re-open a closed-out run and put it back into CORRECTING status. Approvals ' +
          'will not be reset, but the run will need to be resubmitted for close-out. This action is not reversible and should be ' +
          'carefully considered. Are you sure you want to do this?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loggerService.info('Transitioning a completed run back into correcting status');
        this.epicService.transitionRunToCorrecting(this.run.pk, true).subscribe((transitionedRun) => {
          this.transitioningRun = false;
          if (transitionedRun.error) {
            this.showErrorDialog(transitionedRun.error);
            return;
          }
          this.run = transitionedRun;
          this.reload.emit(this.run);
        });
      } else {
        this.transitioningRun = false;
      }
    });
  }

  showErrorDialog(message: string): void {
    this.loggerService.error('Error while transitioning a completed run back to correcting status: ' + message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error while transitioning run to correcting status',
        errorMessage: message
      }
    });
  }

}
