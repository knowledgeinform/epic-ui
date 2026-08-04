import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Run} from '@app/interfaces/Run';
import {NonConformance} from '@app/interfaces/non-conformance';
import {RunStatus} from '@app/interfaces/run-status.dto';

@Component({
  selector: 'app-run-closeout-container',
  templateUrl: './run-closeout-container.component.html',
  styleUrls: ['./run-closeout-container.component.css']
})
export class RunCloseoutContainerComponent implements OnInit {

  @Input() run: Run;
  @Input() isReadonly: boolean;
  @Input() validationErrors: any;
  @Output() reload = new EventEmitter<Run>();
  public RunStatus = RunStatus;

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  reloadComponent(event): void {
    this.run = event;
    this.ref.detectChanges();
    this.reload.emit(this.run);
  }
}
