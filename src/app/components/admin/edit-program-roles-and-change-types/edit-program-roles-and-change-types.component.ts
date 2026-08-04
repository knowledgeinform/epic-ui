import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ProcedureChangeTypeService } from '@app/services/procedure-change-type.service';
import { RoleService } from '@app/services/role.service';
import { ProgramRole } from '@app/interfaces/program-role';
import { ProcedureChangeType } from '@app/interfaces/procedure-change-type';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { Program } from '@app/interfaces/program';

@Component({
  selector: 'app-edit-program-roles-and-change-types',
  templateUrl: './edit-program-roles-and-change-types.component.html',
  styleUrls: ['./edit-program-roles-and-change-types.component.css']
})
export class EditProgramRolesAndChangeTypesComponent implements OnInit, OnDestroy, OnChanges {

  /**
   * The program to edit the role/change type matrix for. If null, edit global defaults.
   */
  @Input() program: Program;

  /**
   * Whether the component should allow input and editing, or be read-only.
   */
  @Input() readOnly: boolean = true;

  public roles: ProgramRole[];
  public changeTypes: ProcedureChangeType[];
  public roleCols: string[];
  public allCols: string[];
  public nonRoleCols: string[] = [
    'acceptsAllSignatures',
    'isEnabled',
    'name',
  ];

  private subscriptions: _.Dictionary<Subscription> = {};

  constructor(
    private changeTypeService: ProcedureChangeTypeService,
    private roleService: RoleService,
  ) { }

  ngOnInit() {

    this.loadChangeTypes();
    this.subscriptions['changeTypesChange'] = this.changeTypeService.onServerDataChange.subscribe( () => {
      this.loadRoles();
      this.loadChangeTypes();
    });

    this.loadRoles();
    this.subscriptions['rolesChange'] = this.roleService.onServerDataChange.subscribe( () => {
      this.loadRoles();
      this.loadChangeTypes();
    });
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, subscription => subscription.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.program) {
      this.loadRoles();
      this.loadChangeTypes();
    }
  }

  private loadChangeTypes() {
    const programPk = _.get(this.program, 'pk');
    let filterObj = {};
    // if program is defined, fill the filterObj with the programPk param, otherwise pass an empty filterObj.
    if (programPk) filterObj = {programPk: programPk};
    this.changeTypeService.getAll(false, filterObj).then(res => this.changeTypes = res);
  }

  private loadRoles() {
    const programPk = _.get(this.program, 'pk');
    let filterObj = {};
    // if program is defined, fill the filterObj with the programPk param, otherwise pass an empty filterObj.
    if (programPk) filterObj = {programPk: programPk};
    this.roleService.getAll(false, filterObj).then( serverRoles => {
        this.roles = serverRoles;
        this.roleCols = _.map(serverRoles, role => role.name);
        this.allCols = this.nonRoleCols.concat(this.roleCols);
      });
  }

  public addRole() {
    const pr = new ProgramRole();
    pr.programPk = _.get(this.program, 'pk');

    pr.name = prompt('Role Name');
    if (_.isEmpty(pr.name)) return;
    this.roleService.upsert(pr);
  }

  public addChangeType() {
    const ct = new ProcedureChangeType();
    ct.programPk = _.get(this.program, 'pk');

    ct.name = prompt('Change Type Name');
    if (_.isEmpty(ct.name)) return;
    this.changeTypeService.upsert(ct);
  }

  public toggleRequirement(changeType: ProcedureChangeType, roleName: string, checked: boolean) {

    // Get role from name:
    const role = _.find(this.roles, role => role.name == roleName);
    if (!role) console.error('Selected role could not be found.')

    // Update in changeType's list.
    checked ?
      changeType.requiredRoleApprovals = _.union(changeType.requiredRoleApprovals, [role.asDTO()])
      : _.remove(changeType.requiredRoleApprovals, exRole => role.name == exRole.name);

    this.changeTypeService.updateRequiredRoleApprovals(changeType.pk, changeType.requiredRoleApprovals);

  }

  public deleteRole(name: String) {
    const role: ProgramRole = _.find(this.roles, r => r.name == name);
    this.roleService.delete(role);
  }

  public deleteChangeType(changeType: ProcedureChangeType) {
    const confirmed = confirm('Are you sure you want to delete the Change Type "' + changeType.name + '"?');
    if (!confirmed) return;
    this.changeTypeService.delete(changeType);
  }

  // TODO: There might be a way to consolidate these toggle methods AND abstract them to the EpicService abstract class. But I'm not quite sure how to without losing type safety on the property being toggled.
  public toggleChangeTypeIsEnabled(changeType: ProcedureChangeType) {
    changeType.isEnabled = !changeType.isEnabled;
    this.changeTypeService
      .upsert(changeType)
      .then(res => {
        changeType.isEnabled = res.isEnabled;
      })
      .catch(err => {
        changeType.isEnabled = !changeType.isEnabled;
      });
  }

  public toggleChangeTypeAcceptsAllSignatures(changeType: ProcedureChangeType) {
    changeType.acceptsAllSignatures = !changeType.acceptsAllSignatures;
    this.changeTypeService
      .upsert(changeType)
      .then(res => {
        changeType.acceptsAllSignatures = res.acceptsAllSignatures;
      })
      .catch(err => {
        changeType.acceptsAllSignatures = !changeType.isEnabled;
      });
  }

  public toggleRoleBypassValidation(role: ProgramRole) {
    role.bypassValidation = !role.bypassValidation;
    this.roleService
      .upsert(role)
      .then(res => role.bypassValidation = res.bypassValidation)
      .catch(err => role.bypassValidation = !role.bypassValidation);
  }

}
