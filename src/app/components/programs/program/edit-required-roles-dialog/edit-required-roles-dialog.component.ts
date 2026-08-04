import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgramRole } from '@app/interfaces/program-role';
import { RoleService } from '@app/services/role.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-required-roles-dialog',
  templateUrl: './edit-required-roles-dialog.component.html',
  styleUrls: ['./edit-required-roles-dialog.component.css']
})
export class EditRequiredRolesDialogComponent implements OnInit {

  public selectedProgramRoles: ProgramRole[];
  public allProgramRoles: ProgramRole[];

  constructor(
    public dialogRef: MatDialogRef<EditRequiredRolesDialogComponent, ProgramRole[]>,
    @Inject(MAT_DIALOG_DATA) public inputProgramRoles: ProgramRole[],
    private roleService: RoleService,
  ) { }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.selectedProgramRoles = _.clone(this.inputProgramRoles);
    this.roleService.getAll().then(roles => {
      this.allProgramRoles = roles;
    });
  }

  public cancel() {
    this.dialogRef.close();
  }

  public save() {
    this.dialogRef.close(this.selectedProgramRoles);
  }

  public onCheckboxChange(role: ProgramRole, checked: boolean) {
    _.remove(this.selectedProgramRoles, spr => spr.name == role.name);
    if (checked) this.selectedProgramRoles.push(role);
  }

}
