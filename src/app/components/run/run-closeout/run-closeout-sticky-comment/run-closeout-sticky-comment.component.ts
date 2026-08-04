import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatDialog} from '@angular/material/dialog';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {Run} from '@app/interfaces/Run';
import {RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import * as _ from 'lodash';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {RunCloseoutStickyReportingService} from '@app/services/run-closeout-sticky-reporting.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { StepDef } from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';

@Component({
  selector: 'app-run-closeout-sticky-comment',
  templateUrl: './run-closeout-sticky-comment.component.html',
  styleUrls: ['./run-closeout-sticky-comment.component.css']
})
export class RunCloseoutStickyCommentComponent implements OnInit {

  @Input() step?: StepDef = null;
  @Input() stepGroup?: StepGroupDef = null;
  @Input() instruction: ProcedureInstruction = null;
  @Input() run: Run;
  @Input() procedureData: ProcedureDetails;
  @Input() readonly: boolean = false;
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();
  runCloseoutStickyComments: RunCloseoutStickyComment[] = [];
  stickyCommentForm: UntypedFormGroup;
  fetchIsDone: boolean = true;

  constructor(
    public epicService: EPICWSService,
    private fb: UntypedFormBuilder,
    public errorDialog: MatDialog,
    public messageService: MessageService,
    private stickyReportingService: RunCloseoutStickyReportingService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.stickyCommentForm = this.fb.group({
      commentText: ['', [Validators.maxLength(2048), Validators.required]]
    });
    if (this.step) {
      this.runCloseoutStickyComments = this.step.runCloseoutStickyComments;
    } else if (this.stepGroup) {
      this.runCloseoutStickyComments = this.stepGroup.runCloseoutStickyComments;
    } else if (this.instruction) {
      this.runCloseoutStickyComments = this.instruction.runCloseoutStickyComments;
    } else {
      this.runCloseoutStickyComments = this.procedureData.runCloseoutStickyComments;
    }
  }

  cancelAddComment() {
    this.stickyCommentForm.reset();
  }

  submitStickyComment() {
    if (this.stickyCommentForm.valid) {
      this.fetchIsDone = false;
      // send the comment with the step pk to the backend to be saved
      const stickyComment = new RunCloseoutStickyComment();
      stickyComment.commentText = this.stickyCommentForm.get('commentText').value;
      stickyComment.isComplete = false;
      stickyComment.procedureDetails = this.procedureData.asDTO();
      if (this.step) {
        stickyComment.stepDef = this.step.asDTO();
      }
      if (this.stepGroup) {
        stickyComment.stepGroupDef = this.stepGroup.asDTO();
      }
      if (this.instruction) {
        stickyComment.procedureInstruction = this.instruction.asDTO();
      }

      this.loggerService.info('Saving run sticky comment', stickyComment);
      this.epicService.submitRunCloseoutStickyComment(stickyComment).subscribe((sticky) => {
        this.fetchIsDone = true;
        if (sticky.error) {
          this.handleError(sticky.error);
        } else {
          if (_.isEmpty(this.procedureData.runCloseoutStickyComments)) {
            this.procedureData.runCloseoutStickyComments = [];
          }
          this.procedureData.runCloseoutStickyComments.push(sticky);
          this.procedureDataChange.emit(this.procedureData);
          this.runCloseoutStickyComments.push(sticky);
          this.cancelAddComment();
          this.messageService.showSnackBar('Run closeout sticky saved', 'CLOSE');
          this.stickyReportingService.findAllStickyComments(this.procedureData);
        }
      });
    }
  }

  deleteStickyComment(comment: RunCloseoutStickyComment, event: MatCheckboxChange): void {
    if (event.checked) {
      this.loggerService.info('Marking run sticky comment as complete and deleting; pk = ' + comment.pk);
      this.epicService.markRunCloseoutStickyAsCompleteAndDelete(comment).subscribe((booleanResult) => {
        if (booleanResult.error) {
          this.handleError(booleanResult.error);
        } else {
          if (booleanResult) {
            const pdIndex = this.procedureData.runCloseoutStickyComments.findIndex(sticky => sticky.pk === comment.pk);
            this.procedureData.runCloseoutStickyComments.splice(pdIndex, 1);
            const arrayIndex = this.runCloseoutStickyComments.findIndex(sticky =>  sticky.pk === comment.pk);
            this.runCloseoutStickyComments.splice(arrayIndex, 1);
            this.messageService.showSnackBar('Sticky has been marked as complete and deleted', 'CLOSE');
            this.procedureDataChange.emit(this.procedureData);
            this.stickyReportingService.findAllStickyComments(this.procedureData);
          }
        }
      });
    }
  }

  handleError(message: string): void {
    this.loggerService.error('Error while either saving or deleting a run closeout sticky: ' + message);
    this.errorDialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error saving/deleting a sticky comment',
        errorMessage: message
      }
    });
  }
}
