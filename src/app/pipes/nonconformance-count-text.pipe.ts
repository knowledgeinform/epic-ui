import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nonconformanceCountText'
})
export class NonconformanceCountTextPipe implements PipeTransform {

  transform(count: number, args?: any): any {
    if (count === 0) {
      return 'There are no non-conformances.';
    } else if (count > 0) {
      return count === 1 ? 'There is one non-conformance.' : 'There are ' + count + ' non-conformances.';
    } else {
      return null;
    }
  }

}
