import {Component, Input, OnInit} from '@angular/core';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {CommentDto} from '@app/interfaces/comment.dto';

@Component({
  selector: 'app-generic-comment-history-display',
  templateUrl: './generic-comment-history-display.component.html',
  styleUrls: ['./generic-comment-history-display.component.css']
})
export class GenericCommentHistoryDisplayComponent implements OnInit {

  @Input() arrayOfCommentsOrHistories: any;
  @Input() titleText: string;
  @Input() addBorder: boolean = true;
  public CommentType = CommentType;

  constructor() { }

  ngOnInit() {
  }

}
