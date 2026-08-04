import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {ProcedureStatus} from "@app/interfaces/procedure-status.dto";
import {LoginService} from "@app/services/login.service";

@Pipe({
  name: 'canEditApprovers'
})
export class CanEditApproversPipe implements PipeTransform {

  constructor(public jwtService: LoginService) {
  }

  transform(procedureData: ProcedureDetails, isLockedFromEditing: boolean): boolean {
    if (ProcedureStatus[procedureData.status] === ProcedureStatus.WAITING || (ProcedureStatus[procedureData.status] === ProcedureStatus.DRAFT && !isLockedFromEditing)) {
      return this.jwtService.currentUser.admin || procedureData.procedureHeader.user.username === this.jwtService.currentUser.userName;
    } else {
      return false;
    }
  }

}
