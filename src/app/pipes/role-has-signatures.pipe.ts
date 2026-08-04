import { Pipe, PipeTransform } from '@angular/core';
import {ProgramRole} from '@app/interfaces/program-role';
import * as _ from 'lodash';

@Pipe({
  name: 'roleHasSignatures'
})
export class RoleHasSignaturesPipe implements PipeTransform {

  transform(roleToCheck: string, roles: ProgramRole[]): boolean {
    const programRole = _.find(roles, role => roleToCheck === role.name);
    if (programRole) {
      if (programRole.blackRedLineSignatures && programRole.blackRedLineSignatures.length > 0) {
        return true;
      }
    }
    return false;
  }

}
