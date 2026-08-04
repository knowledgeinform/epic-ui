import { Injectable } from '@angular/core';
import { ProgramRole } from '@app/interfaces/program-role';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import { EPICWSService } from './epic-ws.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  constructor(
    private epicService: EPICWSService,
  ) { }

  // TODO: Add other program-related methods.

  public updateRequiredRoles(programPk: number, requiredRoles: ProgramRole[]): Promise<void> {
    const requiredRoleDtos: ProgramRoleDTO[] = _.map(requiredRoles, role => role.asDTO());
    return this.epicService.httpPost<void>(`programs/${programPk}/updateRequiredRoles`, requiredRoleDtos);
  }

}
