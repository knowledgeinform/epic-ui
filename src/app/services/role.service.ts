import { Injectable } from '@angular/core';
import { EpicService } from '@app/interfaces/epic-service';
import { ProgramRole } from '@app/interfaces/program-role';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import { EPICWSService } from './epic-ws.service';
import { RosterService } from './roster.service';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class RoleService extends EpicService<ProgramRole,ProgramRoleDTO> {

  constructor(
    protected epicService: EPICWSService,
    private rosterService: RosterService,
  ) {
    super(epicService);
  }

  public basePath = 'ProgramRoles';

  protected getNewLocal() {
    return new ProgramRole();
  }
  // Synchronized version of getAllRolesUserCanSign
  syncGetAllRolesUserCanSign( programPk:number, username:string):Promise<any>{
    return this.getAllRolesUserCanSign(programPk, username);
  }
  getAllRolesUserCanSign(programPk:number, username:string) {
    let filterObj = {};
    // if program is defined, fill the filterObj with the programPk param, otherwise pass an empty filterObj.
    if (programPk) filterObj = {programPk: programPk};

    return this.getAll(false, filterObj).then( serverRoles => { 
       return serverRoles;  // get all the roles for this program.
       // Comment out the following to select roles based on user 
       /* if ( serverRoles.length == 0 ) // No roles are found, just returne empty array
          return serverRoles; 
        
        return this.rosterService.get(programPk).then(roster => {
          // First find whether user is on the roster 
          const userRoster = roster.find( elem => { return elem.user.username == username;}); 
          if (_.isNil(userRoster)) { // User is not assigned roles in this program
            // Pick all the roles bypass validation
            const selectedRoles = _.filter(serverRoles, (elem)=>{return elem.bypassValidation;}); 
            return selectedRoles;
          }
          else { // User has assigned roles
            const userRosterRolePKs = _.chain(userRoster.roles).map(row=>row.pk).value();
            // Combine user roles and roles bypass validation
            const selectedRoles = _.filter(serverRoles, (elem)=>{
              return elem.bypassValidation || userRosterRolePKs.includes(elem.pk); 
            });  
            return selectedRoles;
          }
        });
        */
    });    
  }
}
