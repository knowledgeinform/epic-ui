import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Run} from '@app/interfaces/Run';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {EPICWSService} from '@app/services/epic-ws.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoginService} from '@app/services/login.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-run-closeout-reviewing',
  templateUrl: './run-closeout-reviewing.component.html',
  styleUrls: ['./run-closeout-reviewing.component.css']
})
export class RunCloseoutReviewingComponent implements OnInit {

  @Input() run: Run;
  approved: RunApproval[];
  notApproved: RunApproval[];
  public RunStatus = RunStatus;
  @Output() reload = new EventEmitter<Run>();
  transitioningRun: boolean = false;

  constructor(private epicService: EPICWSService,
              public dialog: MatDialog,
              public jwtService: LoginService,
              private loggerService: LoggerService) {}

  ngOnInit() {
    this.approved = this.run.runApprovals.filter(ra => ra.isApproved);
    this.notApproved = this.run.runApprovals.filter(ra => ra.isApproved === null || !ra.isApproved);
  }

  transitionToCorrectingStatus(): void {
    this.transitioningRun = true;
    this.loggerService.info('Transitioning a run in review status to correcting status');
    this.epicService.transitionRunToCorrecting(this.run.pk, false).subscribe((transitionedRun) => {
      this.transitioningRun = false;
      if (transitionedRun.error) {
        this.showErrorDialog(transitionedRun.error);
        return;
      }
      this.run = transitionedRun;
      this.reload.emit(this.run);
    });
  }

  transitionToCompletedStatus(): void {
    this.transitioningRun = true;
    this.loggerService.info('Transitioning a run in review status to completed status');
    this.epicService.transitionRunToCompleted(this.run.pk).subscribe((transitionedRun) => {
      this.transitioningRun = false;
      if (transitionedRun.error) {
        this.showErrorDialog(transitionedRun.error);
        return;
      }
      this.run = transitionedRun;
      this.reload.emit(this.run);
    });
  }

  showErrorDialog(message: string): void {
    this.loggerService.error('Error while transition a run out of review status: ' + message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error while updating run status',
        errorMessage: message
      }
    });
  }
}
