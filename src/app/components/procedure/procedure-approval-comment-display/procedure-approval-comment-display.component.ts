import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import * as _ from 'lodash';

@Component({
  selector: 'app-procedure-approval-comment-display',
  templateUrl: './procedure-approval-comment-display.component.html',
  styleUrls: ['./procedure-approval-comment-display.component.css']
})
export class ProcedureApprovalCommentDisplayComponent {

  @Input() isReadonly: boolean;
  @Input() procedureData: ProcedureDetails;
  @Output() procedureDataChange = new EventEmitter();

  constructor() { }

  updateProcedureData(pd: ProcedureDetails) {
    _.merge(this.procedureData, pd);
  }

}
