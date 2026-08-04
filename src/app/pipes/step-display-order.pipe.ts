import { Pipe, PipeTransform } from '@angular/core';
import {StepDef} from '@app/interfaces/step-def.interface';

@Pipe({
  name: 'stepDisplayOrder'
})
export class StepDisplayOrderPipe implements PipeTransform {

  transform(step: StepDef): any {
    let displayString = step.displayOrder + '. ';
    let parentGroup = step.stepGroupDef;
    while (parentGroup) {
      displayString = parentGroup.displayOrder + '.' + displayString;
      parentGroup = parentGroup.stepGroupDefParent;
    }
    return displayString;
  }

}
