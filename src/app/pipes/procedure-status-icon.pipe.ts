import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'procedureStatusIcon'
})
export class ProcedureStatusIconPipe implements PipeTransform {

  transform(status: string, args?: any): string {
    switch (status) {
      case 'APPROVED': {
        return 'approval';
      }
      case 'WAITING': {
        return 'watch_later';
      }
      case 'DRAFT': {
        return 'edit';
      }
      case 'READY': {
        return 'check_circle';
      }
      default: {
        return 'help_outline';
      }
    }
  }

}
