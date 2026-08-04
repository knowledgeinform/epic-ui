import { Component, OnInit, Input } from '@angular/core';
import { StepType } from '@app/interfaces/step-type.dto';
import { StepDef } from '@app/interfaces/step-def.interface';

@Component({
  selector: 'app-procedure-step-printable',
  templateUrl: './procedure-step-printable.component.html',
  styleUrls: ['./procedure-step-printable.component.css']
})
export class ProcedureStepPrintableComponent implements OnInit {

  @Input() public step: StepDef;
  @Input() public parentDisplayNumber: string;
  public displayNumber: string;
  public StepType = StepType;

  constructor() { }

  ngOnInit() {
    this.updateDisplayNumber();
  }

  private updateDisplayNumber(): void {
    const prefix = this.parentDisplayNumber ? this.parentDisplayNumber + '.' : '';
    this.displayNumber = prefix + this.step.displayOrder;
  }

}
