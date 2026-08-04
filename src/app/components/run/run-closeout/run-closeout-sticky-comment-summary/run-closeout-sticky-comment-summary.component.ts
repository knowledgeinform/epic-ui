import {Component, Input, OnInit} from '@angular/core';
import {RunCloseoutStickyReportingService} from '@app/services/run-closeout-sticky-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

@Component({
  selector: 'app-run-closeout-sticky-comment-summary',
  templateUrl: './run-closeout-sticky-comment-summary.component.html',
  styleUrls: ['./run-closeout-sticky-comment-summary.component.css']
})
export class RunCloseoutStickyCommentSummaryComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  public CommentType = CommentType;
  public expandAllStickies: boolean = false;

  constructor(
    public stickyReportingService: RunCloseoutStickyReportingService
  ) { }

  ngOnInit() {
  }

}
