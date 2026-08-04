import { Pipe, PipeTransform } from '@angular/core';
import {StepValidation} from '@app/interfaces/step-validation';

@Pipe({
  name: 'tableValidationErrorDescription'
})
export class TableValidationErrorDescriptionPipe implements PipeTransform {

  transform(step: StepValidation, args?: any): any {
    const keys = Object.keys(step.children);
    return step.children[keys[0]].errors[0].description;
  }

}
