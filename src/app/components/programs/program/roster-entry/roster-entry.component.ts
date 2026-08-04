import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RosterMember } from '@app/interfaces/roster-member';
import { RosterService } from '@app/services/roster.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatSnackBar } from '@angular/material/snack-bar';
import { ProgramRole } from '@app/interfaces/program-role';
import { RoleService } from '@app/services/role.service';
import { UntypedFormControl } from '@angular/forms';
import * as _ from 'lodash';
@Component({
  selector: 'app-roster-entry',
  templateUrl: './roster-entry.component.html',
  styleUrls: ['./roster-entry.component.css']
})
export class RosterEntryComponent implements OnInit {

  @Input() member: RosterMember = new RosterMember();
  @Input() readOnly: boolean = false;
  @Input() programPk: number;
  @Output() memberRemove = new EventEmitter<RosterMember>();
  @Output() update = new EventEmitter<RosterMember>();

  @ViewChild('roleInput', /* TODO: add static flag */ {}) roleInput: ElementRef<HTMLInputElement>;
  public SEPARATOR_KEY_CODES: number[] = [ENTER, COMMA];
  private roles: ProgramRole[];
  public filteredRoles: ProgramRole[];
  public roleChipCtrl = new UntypedFormControl();

  constructor(
    public rosterService: RosterService,
    private roleService: RoleService,
    public snackbar : MatSnackBar,
  ) { }

  ngOnInit() {
    this.roleService.getAll(true).then(roles => {
      this.roles = roles;
      this.resetFilteredRoles();
      this.roleChipCtrl.valueChanges.subscribe(val => {
        this.filteredRoles = _.filter(roles, role => _.includes(role.name, val));
      });
    });
  }

  private resetFilteredRoles() {
    this.filteredRoles = this.roles;
  }

  public addRole(role: string) {
    this.rosterService.add(this.programPk, this.member.userId, role).then(res => {
      this.member.roles.add(role);
      this.roleInput.nativeElement.value = '';
    }).catch(err => {
      this.snackbar.open('Could not save change. Please try again.', 'OK');
      console.error('Error adding option to server:', err);
    });
    this.resetFilteredRoles();
  }

  public removeRosterMember(member: RosterMember) {
    if (!member) {
      console.error('Cannot remove roster member for', {member});
      return;
    }
    this.rosterService.removeMember(this.programPk, member.userId).then(res => {
      this.memberRemove.emit(this.member);
    });
  }

  public removeRosterRole(member: RosterMember, role: string) {
    if (!member || !role) {
      console.error('Cannot remove roster role for', {member, role});
      return;
    }
    this.rosterService.removeRole(this.programPk, this.member.userId, role).then(res => {
      member.roles.delete(role);
    });
  }

}
