import { Pipe, PipeTransform } from '@angular/core';
import { ProgramRole } from '@app/interfaces/program-role';
import * as _ from 'lodash';

@Pipe({
  name: 'programRoleIsMet'
})
export class ProgramRoleIsMetPipe implements PipeTransform {

  transform(roleName: string, roles: ProgramRole[]): boolean {
    if (!roleName || !roles) return false;
    return _.some(roles, role => roleName == role.name);
  }

}
