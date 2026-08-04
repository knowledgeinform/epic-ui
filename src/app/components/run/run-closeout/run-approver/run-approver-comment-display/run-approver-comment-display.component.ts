import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Run} from '@app/interfaces/Run';
import {RunStatus} from '@app/interfaces/run-status.dto';

@Component({
  selector: 'app-run-approver-comment-display',
  templateUrl: './run-approver-comment-display.component.html',
  styleUrls: ['./run-approver-comment-display.component.css']
})
export class RunApproverCommentDisplayComponent {

  @Input() isReadonly: boolean;
  @Input() run: Run;
  @Output() runChange = new EventEmitter<Run>();
  public RunStatus = RunStatus;

  constructor() { }

  updateRun(updatedRun: Run): void {
    this.run = updatedRun;
    this.runChange.emit(this.run);
  }
}
