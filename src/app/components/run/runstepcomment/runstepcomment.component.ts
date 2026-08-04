import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RunStepComment} from '@app/interfaces/step-def.dto.interface';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {RunNonconformanceService} from '@app/services/run-nonconformance.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import { Run } from '@app/interfaces/Run';

@Component({
  selector: 'app-runstepcomment',
  templateUrl: './runstepcomment.component.html',
  styleUrls: ['./runstepcomment.component.css']
})
export class RunstepcommentComponent implements OnInit {

  @Input() isReadOnly: boolean = false;
  @Input() step: StepDef;
  @Input() run: Run;
  @Output() stepChange = new EventEmitter();
  valueCommentForm: UntypedFormGroup;
  fetchIsDone: boolean = true;
  constructor(
    public epicService: EPICWSService,
    private fb: UntypedFormBuilder,
    public errorDialog: MatDialog,
    public messageService: MessageService,
    public runNonconformanceService: RunNonconformanceService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.valueCommentForm = this.fb.group({
      commentText: ['', [Validators.maxLength(2048), Validators.required]],
      nonconformance: [false]
    });
  }

  cancelAddComment() {
    this.valueCommentForm.reset();
  }

  submitValueComment() {
    if (this.valueCommentForm.valid) {
      this.fetchIsDone = false;
      // send the comment with the step pk to the backend to be saved
      const runStepComment = new RunStepComment;
      runStepComment.commentText = this.valueCommentForm.get('commentText').value;
      runStepComment.isNonconformance = this.valueCommentForm.get('nonconformance').value;

      this.loggerService.info('Saving run step comment for step with pk ' + this.step.pk + '; runStepComment=' + runStepComment.commentText);
      this.epicService.saveNewRunStepComment(this.step.pk, runStepComment).subscribe((data) => {
        // handle errors
        this.fetchIsDone = true;
        if (data.error) {
          this.loggerService.error('Could not save run step comment; ' + data.error);
          this.errorDialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error saving run comment',
              errorMessage: data.error
            }
          });
        } else {
          // add the comment object to the step runStepComments field
          if (this.step.runStepComments === null || this.step.runStepComments === undefined) {
            this.step.runStepComments = [];
          }
          this.step.runStepComments.push(data);
          this.cancelAddComment();
          this.messageService.showSnackBar('Run Comment Saved', 'CLOSE');
          this.updateRunNonConformance();
        }
      });
    }
  }

  private updateRunNonConformance() {
    this.runNonconformanceService.findNonConformancesInProcedure(this.run);
  }
}
