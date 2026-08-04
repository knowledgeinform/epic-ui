import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {RunApproval} from '@app/interfaces/run-approval.dto';
@Pipe({
  name: 'approverIsApprovedTitle'
})
export class ApproverIsApprovedTitlePipe implements PipeTransform {

  transform(approval: RunApproval | ProcedureApproval, args?: any): string {
    if ( approval.approverDisabled) {
      return "This approver has been disabled";
    }
    switch (approval.isApproved) {
      case null: {
        return 'No Decision Yet';
      }
      case true: {
        return 'Approved';
      }
      case false: {
        return 'Rejected';
      }
      case undefined: {
        return 'No Decision Yet';
      }
      default: {
        return 'Unknown Status';
      }
    }
  }

}
