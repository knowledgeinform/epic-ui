import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {CommentDto, RedLineComment} from '@app/interfaces/comment.dto';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BlackLineDto} from '@app/interfaces/black-line.dto';
import { ProcedureDetailsDTO } from '@app/interfaces/procedure-details.dto';

@Component({
  selector: 'app-red-line-comment-dialog',
  templateUrl: './red-black-line-comment-dialog.component.html',
  styleUrls: ['./red-black-line-comment-dialog.component.css']
})
export class RedBlackLineCommentDialogComponent implements OnInit {

  commentType: CommentType;
  comment: CommentDto;
  disableForSaving: boolean = false;
  public CommentType = CommentType;

  constructor(public dialogRef: MatDialogRef<RedBlackLineCommentDialogComponent, CommentDto>,
              @Inject(MAT_DIALOG_DATA) data: RedBlackLineCommentDialogData,
  ) {
    this.commentType = data.commentType;
    if (this.commentType === CommentType.RED_LINE_COMMENT) {
      this.comment = new RedLineComment({procedureDetails: data.procedureDetails});
    } else if (this.commentType === CommentType.BLACK_LINE_COMMENT) {
      this.comment = new BlackLineDto({procedureDetails: data.procedureDetails});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.comment.commentText = '';
  }

  public clearComment(): void {
    this.comment.commentText = '';
  }

  public cancel(): void {
    this.dialogRef.close(null);
  }

  public submitLineEditComment(): void {
    this.disableForSaving = true;
    this.dialogRef.close(this.comment);
  }

  onCommentChange(comment: CommentDto): void {
    this.comment = comment;
  }
}

export interface RedBlackLineCommentDialogData {
  commentType: CommentType,
  procedureDetails: ProcedureDetailsDTO,
}
