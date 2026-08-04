import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {RunApproval} from '@app/interfaces/run-approval.dto';

@Pipe({
  name: 'approverIsApprovedIcon'
})
export class ApproverIsApprovedIconPipe implements PipeTransform {

  transform(approval: RunApproval | ProcedureApproval, args?: any): string {
    if ( approval.approverDisabled) {
         return 'person_add_disabled';
    }
    switch (approval.isApproved) {
      case null: {
        return 'watch_later';
      }
      case true: {
        return 'check_circle';
      }
      case false: {
        return 'cancel';
      }
      default: {
        return 'contact_support';
      }
    }
  }

}
