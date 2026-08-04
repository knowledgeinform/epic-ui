import { Pipe, PipeTransform } from '@angular/core';
import {ValidationErrors} from '@app/interfaces/validation-errors';
import {StepType} from '@app/interfaces/step-type.dto';

@Pipe({
  name: 'validationErrorIconColor'
})
export class ValidationErrorIconColorPipe implements PipeTransform {

  transform(error: ValidationErrors, args?: any): any {
    switch (error) {
      case 'STEP_WITNESS_SIGNATURE_REQUIRED': {
        return '#008000';
      }
      case 'STEP_INSPECTION_SIGNATURE_REQUIRED': {
        return '#efd300';
      }
      case 'FIELD_REQUIRED': {
        return '#000000';
      }
      default: {
        return '#000000';
      }
    }
  }

}
