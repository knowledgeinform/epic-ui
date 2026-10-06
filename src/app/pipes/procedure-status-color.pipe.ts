import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'procedureStatusColor'
})
export class ProcedureStatusColorPipe implements PipeTransform {

  transform(status: string, args?: any): string {
    switch (status) {
      case 'APPROVED': {
        return '#008000';
      }
      case 'WAITING': {
        return '#000';
      }
      case 'DRAFT': {
        return '#ffb100';
      }
      case 'READY': {
        return '#008000';
      }
      default: {
        return '#000';
      }
    }
  }

}
