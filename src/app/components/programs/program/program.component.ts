import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AutocompleteDialogBinder, SingleAutocompleteDialogComponent } from '@app/components/single-autocomplete-dialog/single-autocomplete-dialog.component';
import { Program } from '@app/interfaces/program';
import { ProgramRole } from '@app/interfaces/program-role';
import { RosterMember } from '@app/interfaces/roster-member';
import { Users } from '@app/interfaces/users';
import { EPICWSService } from '@app/services/epic-ws.service';
import { LoginService } from '@app/services/login.service';
import { MessageService } from '@app/services/message.service';
import { OfflineService } from '@app/services/offline.service';
import { ProgramService } from '@app/services/program.service';
import { RoleService } from '@app/services/role.service';
import { RosterService } from '@app/services/roster.service';
import * as _ from 'lodash';
import { EditRequiredRolesDialogComponent } from './edit-required-roles-dialog/edit-required-roles-dialog.component';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit {

  public program: Program;
  public readOnly: boolean = false;
  private programRoles: ProgramRole[];
  public tabId: number = 0;

  constructor(
    private epicService: EPICWSService,
    private rosterService: RosterService,
    private route: ActivatedRoute,
    private router: Router,
    protected dialog: MatDialog,
    private loginService: LoginService,
    private offlineService: OfflineService,
    private programService: ProgramService,
    private messageService: MessageService,
    private roleService: RoleService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      this.tabId = parseInt(paramMap.get('tabId'));
      this.load(paramMap.get('programCode'));
    });
    this.offlineService.offlineSubject.subscribe(isOffline => {
      this.updateReadOnly(isOffline);
    });
    this.updateReadOnly(false);
  }

  // TODO: Consider abstracting common tab code & properties to an (abstract?) class (e.g. "Tabable").
  public onSelectedIndexChange(newIndex: number) {
    this.router.navigate(['../', newIndex], { relativeTo: this.route });
  }

  private load(programCode: string) {

    this.roleService.getAll().then(roles => {
      this.programRoles = roles;
    });

    this.epicService.getPrograms().then(programs => {
      this.program = new Program().loadFromDTO(_.find(programs, p => p.code == programCode));

      this.rosterService.get(this.program.pk).then(roster => {
        this.program.roster = _.map(roster, elm => {
          const rm: RosterMember = {
            userId: elm.user.userId,
            name: elm.user.displayName,
            roles: new Set(_.map(elm.roles, role => role.name)),
          };
          return rm;
        });
      });

    });
  }

  /**
   * Sets `this.readOnly` true if user is not an admin or client is offline.
   */
  private updateReadOnly(isOffline: boolean) {
    this.readOnly = !this.loginService.currentUser.admin || isOffline;
  }

  public showAddRosterMemberDialog(): MatDialogRef<SingleAutocompleteDialogComponent, Users> {
    const validator: AutocompleteDialogBinder<Users> = {
      title: 'Add Roster Member',
      instructions: '',
      placeholder: 'Name or 521',
      autocompleteSource: this.epicService.getMatchingUsers,
      autocompleteDisplay: user => user ? user.displayName : undefined,  // TODO: Use nullish coalescing operator, once we upgrade typescript.
      validateSelection: (user) =>
        _.some(this.program.roster, member => member.userId == user.userId) ? 'This user is already in the roster.' : null,
    };

    const dialog = this.dialog.open(SingleAutocompleteDialogComponent, {
      width: '300px',
      data: { validator },
      disableClose: true,
    });

    dialog.afterClosed().subscribe((addedUser: Users) => {
      this.program.roster.push(new RosterMember(addedUser));
    });

    return dialog;
  }

  public removeRosterMember(member: RosterMember) {
    _.remove(this.program.roster, member);
  }

  public editRequiredRoles() {
    if (_.isEmpty(this.programRoles)) {
      this.messageService.showSnackBar("No roles are available to assign to this program. Please contact an admin to resolve this issue.", 'OK', 5000);
      return;
    }
    this.dialog.open(EditRequiredRolesDialogComponent, {
      width: '300px',
      data: this.program.requiredProgramRoles,
      disableClose: true,
    })
      .afterClosed().subscribe((requiredRoles: ProgramRole[]) => {
        if (!requiredRoles) return;
        this.programService.updateRequiredRoles(this.program.pk, requiredRoles).then(() => {
          this.program.requiredProgramRoles = requiredRoles;
        });
      });
  }

}
