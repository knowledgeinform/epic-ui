import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureApproval} from "@app/interfaces/procedure-approval.dto";

@Pipe({
  name: 'approverChipDisabledTooltip'
})
export class ApproverChipDisabledTooltipPipe implements PipeTransform {

  transform(approval: ProcedureApproval, userCanEditApprovers: boolean): string {
    return userCanEditApprovers ? `This user has has been disabled.` : '';
  }

}
