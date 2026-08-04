import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {LoginService} from '@app/services/login.service';
import {EPICWSService} from '@app/services/epic-ws.service';
import {RunCloseoutComment, RunCloseoutCommentReply} from '@app/interfaces/comment.dto';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-run-approver-comment',
  templateUrl: './run-approver-comment.component.html',
  styleUrls: ['./run-approver-comment.component.css']
})
export class RunApproverCommentComponent implements OnInit {

  @Input() isReply: boolean;
  @Input() approverUsername: string;
  @Input() parent: any;
  @Output() parentChange = new EventEmitter<Observable<any>>();
  showCommentEntry = false;
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
              private jwtService: LoginService,
              private epicService: EPICWSService,
              private dialog: MatDialog,
              private loggerService: LoggerService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      comment: ['', [Validators.maxLength(2048), Validators.required]]
    });
  }

  get hideCommentButton() {
    if (this.jwtService.currentUserName === null) {
      return true;
    }
    if (this.isReply === true) {
      return false;
    } else if (this.approverUsername === this.jwtService.currentUserName) {
      return false;
    }
    return true;
  }


  showComment() {
    this.showCommentEntry = true;
  }

  cancel() {
    this.showCommentEntry = false;
    this.form.reset();
  }

  submit() {
    if (this.form.valid) {
      if (this.isReply) {
        this.saveRunCloseoutCommentReply();
      } else {
        this.saveRunCloseoutComment();
      }
    }
  }

  private saveRunCloseoutComment(): void {
    const comment = new RunCloseoutComment();
    comment.commentType = CommentType.RUN_CLOSEOUT_COMMENT;
    comment.runApproval = this.parent;
    comment.commentText = this.form.get('comment').value;

    this.loggerService.info('Saving run closeout comment for run approval with pk ' + this.parent.pk + '; comment=' + comment.commentText);
    this.epicService.submitRunCloseoutComment(comment).subscribe((closeoutComment) => {
      if (!closeoutComment.error) {
        if (this.parent.comments == null) {
          this.parent.comments = [];
        }
        this.parent.comments.push(closeoutComment);
        this.parentChange.emit(this.parent);
        this.cancel();
      } else {
        this.displayErrorDialog(closeoutComment.error);
      }
    });
  }

  private saveRunCloseoutCommentReply(): void {
    const reply = new RunCloseoutCommentReply();
    reply.commentType = CommentType.RUN_CLOSEOUT_COMMENT_REPLY;
    reply.runCloseoutComment = this.parent;
    reply.commentText = this.form.get('comment').value;

    this.loggerService.info('Saving run closeout comment reply to run closeout comment with pk ' + this.parent.pk + '; comment=' + reply.commentText);
    this.epicService.submitRunCloseoutCommentReply(reply).subscribe((closeoutReply) => {
      if (!closeoutReply.error) {
        if (this.parent.replies == null) {
          this.parent.replies = [];
        }
        this.parent.replies.push(closeoutReply);
        this.parentChange.emit(this.parent);
        this.cancel();
      } else {
        this.displayErrorDialog(closeoutReply.error);
      }
    });
  }

  displayErrorDialog(message: string): void {
    this.loggerService.error('Error saving a run closeout comment/reply: ' + message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: 'Error while updating run close-out approver display',
        errorMessage: message
      }
    });
  }
}
