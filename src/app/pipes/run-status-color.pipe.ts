import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'runStatusColor'
})
export class RunStatusColorPipe implements PipeTransform {

  transform(status: string, args?: any): any {
    switch (status) {
      case 'RUNNING': {
        return '#ffb100';
      }
      case 'REVIEWING': {
        return '#000';
      }
      case 'CORRECTING': {
        return '#e40000';
      }
      case 'COMPLETED': {
        return '#008000';
      }
      case 'ABANDONED': {
        return '#e40000';
      }
      case 'APPROVED': {
        return '#008000';
      }
      default: {
        return '#000';
      }
    }
  }

}
