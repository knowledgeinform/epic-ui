import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { ProgramRole } from '@app/interfaces/program-role';
import { LoginService } from '@app/services/login.service';
import { RoleService } from '@app/services/role.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-role-selection',
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.css']
})
export class RoleSelectionComponent implements OnInit {
  @Input() procedureData: ProcedureDetails;
  @Input() prevSelectedRole?: ProgramRole;

  @Output() selectedRoleChange: EventEmitter<ProgramRole> = new EventEmitter();

  allUserRoles: ProgramRole[] = [];
  selectedRoleName: string;

  constructor( private roleService : RoleService, 
               private loginService : LoginService) { }

  ngOnInit():void {
    this.selectedRoleName = this.prevSelectedRole?this.prevSelectedRole.name:undefined;
  }
  async ngAfterViewInit(){
    const programPk = this.procedureData.procedureDef.program.pk;
    const username =  this.loginService.getCurrentUser().username;
    this.allUserRoles = await this.roleService.syncGetAllRolesUserCanSign(programPk, username); 
    const allSignatures = new ProgramRole();
    allSignatures.name = "Accepts All Signatures";

    if (this.allUserRoles.length > 0) {
      this.allUserRoles.push(allSignatures);
    } else {
      this.allUserRoles = [];
      this.allUserRoles.push(allSignatures);
    }
  }
  updateSelectedRole() {
    const selectedRole = _.find(this.allUserRoles, elem=> elem.name == this.selectedRoleName);
    this.selectedRoleChange.emit(selectedRole);
  }
}
