import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureApproval} from "@app/interfaces/procedure-approval.dto";
import * as _ from "lodash";

@Pipe({
  name: 'approverChipTooltip'
})
export class ApproverChipTooltipPipe implements PipeTransform {

  transform(approval: ProcedureApproval, userCanEditApprovers: boolean): string {
    return userCanEditApprovers ? `This user has ${approval.isApproved ? '' : 'not'} approved and has ${_.get(approval, 'comments.length', 0)} comments.` : '';
  }

}
