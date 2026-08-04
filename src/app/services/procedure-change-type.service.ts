import { Injectable } from '@angular/core';
import { EpicService } from '@app/interfaces/epic-service';
import { ProcedureChangeType } from '@app/interfaces/procedure-change-type';
import { ProcedureChangeTypeDTO } from '@app/interfaces/procedure-change-type.dto';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import { EPICWSService } from './epic-ws.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ProcedureChangeTypeService extends EpicService<ProcedureChangeType, ProcedureChangeTypeDTO> {

  constructor(
    protected epicService: EPICWSService,
  ) {
    super(epicService);
  }

  protected basePath = 'ProcedureChangeTypes';

  protected getNewLocal() {
    return new ProcedureChangeType();
  }

  public updateRequiredRoleApprovals(changeTypePk: number, requiredRoleApprovals: ProgramRoleDTO[]) {
    return this.epicService.httpPost(
      `${this.basePath}/${changeTypePk}`,
      requiredRoleApprovals,
    );
  }

  public getChangeTypes(programPk: number): Promise<ProcedureChangeTypeDTO[]> {
    return this.epicService.httpGet<ProcedureChangeTypeDTO[]>(
      `${this.basePath}/ChangeTypes/${programPk}`
    );
  }

}
