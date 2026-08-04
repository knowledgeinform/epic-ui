import {Pipe, PipeTransform} from '@angular/core';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import { StepDef } from '@app/interfaces/step-def.interface';

@Pipe({
  name: 'stepDisplayName'
})
export class StepDisplayNamePipe implements PipeTransform {

  transform(step: StepDefDTO | StepDef, args?: any): any {
    if (step.stepName == null || step.stepName.trim().length == 0) {
      let displayName = step.instructions;
      displayName = displayName.replace(/(<([^>]+)>)/gi, "");
      displayName = displayName.replace(/&nbsp;/gi, " ");
      displayName = displayName.replace(/&amp;/gi, "&");
      displayName = displayName.substr(0, 50);

      if (step.instructions.length > 50) {
        displayName += '...';
      }
      return displayName;
    } else {
      return step.stepName;
    }
  }

}
