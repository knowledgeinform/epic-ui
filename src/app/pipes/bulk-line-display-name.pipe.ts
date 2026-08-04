import { Pipe, PipeTransform } from '@angular/core';
import {StepDefDTO} from "@app/interfaces/step-def.dto.interface";
import {StepDef} from "@app/interfaces/step-def.interface";
import {StepGroupDef} from "@app/interfaces/step-group-def";
import {ProcedureInstruction} from "@app/interfaces/procedure-instruction";
import {StepGroupDisplayOrderPipe} from "@app/pipes/step-group-display-order.pipe";
import {StepDisplayNamePipe} from "@app/pipes/step-display-name.pipe";
import {StepDisplayOrderPipe} from "@app/pipes/step-display-order.pipe";

@Pipe({
  name: 'bulkLineDisplayName'
})
export class BulkLineDisplayNamePipe implements PipeTransform {

  transform(step: StepDefDTO | StepDef | StepGroupDef | ProcedureInstruction, args?: any): any {
    if (step instanceof StepGroupDef){
      return new StepGroupDisplayOrderPipe().transform(step, step.displayOrder) + " " + step.stepGroupName;
    } else if (step instanceof ProcedureInstruction) {
      return step.displayOrder + ". " + step.sectionName;
    } else if (step instanceof StepDef) {
      return new StepDisplayOrderPipe().transform(step) +
        new StepDisplayNamePipe().transform(step);
    }
  }

}
