import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EPICWSService} from '../../../services/epic-ws.service';
import {Observable} from 'rxjs';
import {LoginService} from '../../../services/login.service';
import {LoggerService} from '@app/services/logger.service';
@Component({
  selector: 'app-procedure-approval-comment',
  templateUrl: './procedure-approval-comment.component.html',
  styleUrls: ['./procedure-approval-comment.component.css']
})
export class ProcedureApprovalCommentComponent implements OnInit {

  disableReplyButton : boolean = false;

  @Input() isReply: boolean;
  @Input() approverUsername: string;
  @Input() parent: any;
  @Input() isReadonly: boolean = false;
  @Input() procedureData;
  @Output() parentChange = new EventEmitter<Observable<any>>();
  showCommentEntry = false;
  form: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
              private jwtService: LoginService,
              private epicService: EPICWSService,
              private loggerService: LoggerService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      comment: ['', [Validators.maxLength(2048), Validators.required]]
    });
    const elem = this.procedureData.procedureApprovals.find(e => e.approvalType === 'APPROVER'&&
                                                                e.approverDisabled &&
                                                                e.users.username === this.jwtService.currentUserName);

    this.disableReplyButton = elem !== undefined;
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
      this.form.value.isReply = this.isReply;
      this.form.value.parentPk = this.parent.pk;
      this.loggerService.info('Saving approval comment: ' + this.form.value);
      this.epicService.saveProcedureApprovalComment(this.form.value).subscribe((data) => {
        if (this.isReply === false) {
          if (this.parent.comments == null) {
            this.parent.comments = [];
          }
          this.parent.comments.push(data);
        } else {
          if (this.parent.replies == null) {
            this.parent.replies = [];
          }
          this.parent.replies.push(data);
        }
        this.parentChange.emit(this.parent);
        this.cancel();
      });
    }
  }
}
