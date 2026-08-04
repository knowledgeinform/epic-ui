import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommentType } from '@app/interfaces/comment-type.dto';
import { RedBlackLineComment } from '@app/interfaces/comment.dto';
import { ProcedureChangeTypeDTO } from '@app/interfaces/procedure-change-type.dto';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-red-black-line-comment',
  templateUrl: './red-black-line-comment.component.html',
  styleUrls: ['./red-black-line-comment.component.css']
})
export class RedBlackLineCommentComponent implements OnInit {

  @Input() comment: RedBlackLineComment;
  @Input() disableForSaving: boolean = false;
  @Output() commentChange = new EventEmitter<any>();
  @Output() validationChange = new EventEmitter<boolean>();
  commentTextChanged: Subject<string> = new Subject<string>();
  public CommentType = CommentType;
  public changeTypes: ProcedureChangeTypeDTO[];
  public isValid: boolean = false;

  constructor(
  ) {
    this.commentTextChanged
      .pipe(debounceTime(1500))
      .subscribe(model => {
        if (!this.comment) return;
        if (this.comment.commentType === CommentType.RED_LINE_COMMENT) {
          this.commentChange.emit(this.comment);
        }
        this.emitIsValidChange();
      });
  }

  ngOnInit() {
  }

  onCommentTextChange(): void {
    this.updateIsValid();
    this.commentTextChanged.next(this.comment.commentText);
  }

  public updateIsValid() {
    this.isValid = this.comment
      && this.comment.commentType
      && _.get(this.comment.commentText, 'length') > 0
      && !!this.comment.procedureChangeType;
  }

  public emitIsValidChange() {
    this.validationChange.next(this.isValid);
  }

}
