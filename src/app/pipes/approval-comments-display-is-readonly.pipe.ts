import {Pipe, PipeTransform} from '@angular/core';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';
import {RunStatus} from '@app/interfaces/run-status.dto';

@Pipe({
  name: 'approvalCommentsDisplayIsReadonly'
})
export class ApprovalCommentsDisplayIsReadonlyPipe implements PipeTransform {

  transform(status: ProcedureStatus | RunStatus): boolean {
    if (ProcedureStatus[status] === ProcedureStatus.READY || RunStatus[status] === RunStatus.COMPLETED) return true;

    return false;
  }
}
