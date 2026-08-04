import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'approverDueDate'
})
export class ApproverDueDatePipe implements PipeTransform {

  transform(dueDate: Date, args?: any): any {
    return dueDate ? new Date(dueDate) : null;
  }

}
