import { Component, OnInit, Input } from '@angular/core';
import { StepGroupDef } from '@app/interfaces/step-group-def';

@Component({
  selector: 'app-procedure-step-group-printable',
  templateUrl: './procedure-step-group-printable.component.html',
  styleUrls: ['./procedure-step-group-printable.component.css']
})
export class ProcedureStepGroupPrintableComponent implements OnInit {

  @Input() public stepGroup: StepGroupDef;
  @Input() public parentDisplayNumber: string;
  public displayNumber: string;

  constructor() {
  }

  ngOnInit() {
    this.updateDisplayNumber();
  }

  private updateDisplayNumber(): void {
    const prefix = this.parentDisplayNumber ? this.parentDisplayNumber + '.' : '';
    this.displayNumber = prefix + this.stepGroup.displayOrder;
  }

}
