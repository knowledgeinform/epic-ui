import { Injectable } from '@angular/core';
import { EPICWSService } from './epic-ws.service';
import { UsersDTO } from '@app/interfaces/users.dto';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';

@Injectable({
  providedIn: 'root'
})
export class RosterService {

  private cached: UserRolesPair[];

  constructor(
    private epicService: EPICWSService,
  ) { }

  /**
   * Returns a map of users to their roles. If `useCache` is `true`, load cached results without making a server call; else call the server and update the cache.
   */
  public get(programPk: number, useCache?: boolean) {

    if (useCache && this.cached) return Promise.resolve(this.cached);

    return this.epicService.httpGet<UserRolesPair[]>(`Roster/${programPk}`).then( map => {
      this.cached = map;
      return map;
    });

  }

  public add(programPk: number, userId: number, role: string) {
    return this.epicService.httpPost<{
      user: UsersDTO,
      roles: ProgramRoleDTO[],
    }[]>(`Roster/${programPk}`, role, {userId});
  }

  public removeRole(programPk: number, userId: number, role: string) {
    return this.epicService.httpDelete<{
      user: UsersDTO,
      roles: ProgramRoleDTO[],
    }[]>(`Roster/${programPk}`, {userId, role});
  }

  public removeMember(programPk: number, userId: number) {
    return this.epicService.httpDelete<{
      user: UsersDTO,
      roles: ProgramRoleDTO[],
    }[]>(`Roster/${programPk}/removeMember/${userId}`);
  }

}

export interface UserRolesPair {
  user: UsersDTO,
  roles: ProgramRoleDTO[],
};
