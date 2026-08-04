import { Pipe, PipeTransform } from '@angular/core';
import {StepGroupDef} from '@app/interfaces/step-group-def';

@Pipe({
  name: 'stepGroupDisplayOrder'
})
export class StepGroupDisplayOrderPipe implements PipeTransform {

  transform(stepGroup: StepGroupDef, displayOrder: number): any {
    let displayString = '';
    if (stepGroup) {
      displayString = stepGroup.displayOrder + '. ';
      let parentGroup = stepGroup.stepGroupDefParent;
      while (parentGroup) {
        displayString = parentGroup.displayOrder + '.' + displayString;
        parentGroup = parentGroup.stepGroupDefParent;
      }
    }
    return displayString;
  }
}
