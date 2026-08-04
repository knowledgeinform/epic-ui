import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'runStatusIcon'
})
export class RunStatusIconPipe implements PipeTransform {

  transform(status: string, args?: any): any {
    switch (status) {
      case 'RUNNING': {
        return 'directions_run';
      }
      case 'REVIEWING': {
        return 'assignment';
      }
      case 'CORRECTING': {
        return 'edit';
      }
      case 'COMPLETED': {
        return 'check_circle';
      }
      case 'ABANDONED': {
        return 'not_interested';
      }
      case 'APPROVED': {
        return 'approval';
      }
      default: {
        return 'help_outline';
      }

    }
  }

}
