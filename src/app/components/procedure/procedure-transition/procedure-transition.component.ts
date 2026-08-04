import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {Router} from '@angular/router';
import { Moment } from 'moment';
import {MessageService} from '@app/services/message.service';
import {LoggerService} from '@app/services/logger.service';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';

@Component({
  selector: 'app-procedure-transition',
  templateUrl: './procedure-transition.component.html',
  styleUrls: ['./procedure-transition.component.css']
})
export class ProcedureTransitionComponent {
  @Input() procedureData;
  @Input() isLockedFromEditing: boolean = false;

  form = this.formBuilder.group({
    dueDate: ['', Validators.required]
  });

  get approvers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'APPROVER');
  }

  get reviewers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'REVIEWER');
  }

  constructor(private formBuilder: UntypedFormBuilder,
              private router: Router,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private loggerService: LoggerService,
              private dialog: MatDialog) {
  }

  submit() {
    // checks that all fields are valid
    if (this.form.valid) {
      const date = this.form.get('dueDate').value as Moment;
      this.loggerService.info('Transitioning procedure with pk ' + this.procedureData.pk + ' to Waiting/In Review');
      this.epicService.transitionProcToWaiting(this.procedureData.pk, date.toDate()).subscribe((data) => {
        if (!data.error) {
          // routes to procedure to display the new procedure and closes the dialog
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
            this.router.navigate(['procedure', data.id]));
        } else {
          this.loggerService.error('Could not transition to In Review/Waiting status for procedure with pk ' + this.procedureData.pk + '; ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error transitioning procedure to Waiting/In Review status',
              errorMessage: data.error
            }
          });
        }
      });
    }
  }
}
