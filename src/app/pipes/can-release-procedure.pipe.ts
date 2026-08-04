import {Pipe, PipeTransform} from '@angular/core';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';

@Pipe({
  name: 'canReleaseProcedure'
})
export class CanReleaseProcedurePipe implements PipeTransform {

  transform(status: ProcedureStatus, args?: any): boolean {
    const procedureStatus = ProcedureStatus[status];

    if (procedureStatus === ProcedureStatus.WAITING || procedureStatus === ProcedureStatus.APPROVED) return true;
    return false;
  }
}
