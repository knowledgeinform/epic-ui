import { Pipe, PipeTransform } from '@angular/core';
import { RosterMember } from '@app/interfaces/roster-member';
import * as _ from 'lodash';

@Pipe({
  name: 'rosterRoleIsMet',
  pure: false,  // TODO: See if we can make this a pure pipe. Maybe if, on role add event, we generated a list of all members' roles, and passed that new list into a pure pipe? Or maybe just clone the roster array on each update?
})
export class RosterRoleIsMetPipe implements PipeTransform {

  transform(roleName: string, fullRoster: RosterMember[]): boolean {
    if (!roleName || !fullRoster) return false;
    return _.some(fullRoster, member => member.roles.has(roleName));
  }

}
