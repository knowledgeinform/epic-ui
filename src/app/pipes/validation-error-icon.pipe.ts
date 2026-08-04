import { Pipe, PipeTransform } from '@angular/core';
import {ValidationErrors} from '@app/interfaces/validation-errors';
import {StepType} from '@app/interfaces/step-type.dto';

@Pipe({
  name: 'validationErrorIcon'
})
export class ValidationErrorIconPipe implements PipeTransform {

  transform(error: ValidationErrors, stepType?: StepType): any {
    switch (error) {
      case 'STEP_WITNESS_SIGNATURE_REQUIRED': {
        return 'person';
      }
      case 'STEP_INSPECTION_SIGNATURE_REQUIRED': {
        return 'assignment_turned_in';
      }
      case 'FIELD_REQUIRED': {
        switch (stepType) {
          case 'CHECKBOX': {
            return 'check_box';
          }
          case 'SINGLE_VALUE': {
            return 'input';
          }
          case 'TABLE': {
            return 'table_chart';
          }
          default: {
            return 'help_outline';
          }
        }
      }
      default: {
        return 'help_outline';
      }
    }
  }

}
