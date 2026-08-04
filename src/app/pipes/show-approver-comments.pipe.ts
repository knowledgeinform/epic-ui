import { Pipe, PipeTransform } from '@angular/core';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { ProcedureStatus } from '@app/interfaces/procedure-status.dto';

@Pipe({
  name: 'showApproverComments'
})
export class ShowApproverCommentsPipe implements PipeTransform {

  transform(procedureData: ProcedureDetails): boolean {
    if (procedureData) {
      if (procedureData.status !== ProcedureStatus.DRAFT) {
        return true;
      } else {
        if (procedureData.procedureApprovals) {
          for (const approver of procedureData.procedureApprovals) {
            if (approver.comments != null && approver.comments.length > 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
