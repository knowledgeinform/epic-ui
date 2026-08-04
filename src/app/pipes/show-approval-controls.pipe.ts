import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import {LoginService} from '@app/services/login.service';

@Pipe({
  name: 'showApprovalControls'
})
export class ShowApprovalControlsPipe implements PipeTransform {

  constructor(public jwtService: LoginService) {
  }

  transform(approval: RunApproval | ProcedureApproval, isReadonly: boolean): any {
    if (isReadonly || this.jwtService.currentUserName === null) return false;
    if (approval.users.username === this.jwtService.currentUserName) return true;
    return false;
  }

}
