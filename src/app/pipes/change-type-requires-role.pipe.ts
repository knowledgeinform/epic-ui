import { Pipe, PipeTransform } from '@angular/core';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import * as _ from 'lodash';

@Pipe({
  name: 'changeTypeRequiresRole'
})
export class ChangeTypeRequiresRolePipe implements PipeTransform {

  /**
   * Returns whether a specified role name is in the list of required required roles.
   */
  transform(requiredRoles: ProgramRoleDTO[], roleToFind: string): boolean {
    return _.some(requiredRoles, role => role.name == roleToFind);
  }

}
