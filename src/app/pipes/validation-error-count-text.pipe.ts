import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationErrorCountText'
})
export class ValidationErrorCountTextPipe implements PipeTransform {

  transform(validationErrors: any, args?: any): any {
    if (!validationErrors) {
      return 'There are no validation errors.';
    }
    const count = validationErrors.selfAndChildErrorCount;
    if (count === 0) {
      return 'There are no validation errors.';
    } else if (count > 0) {
      return count === 1 ? 'There is one validation error.' : 'There are ' + count + ' validation errors.';
    } else {
      return null;
    }
  }
}
