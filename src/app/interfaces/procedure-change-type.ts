import { Local, LocalProperties } from './local.class';
import { ProcedureChangeTypeDTO } from './procedure-change-type.dto';
import { ProgramRoleDTO } from './program-role.dto';
import * as _ from 'lodash';

export class ProcedureChangeType extends Local<ProcedureChangeTypeDTO, ProcedureChangeType> {

  pk: number;
  name: string;
  isEnabled: boolean = true;
  acceptsAllSignatures: boolean = false;
  description: string;
  requiredRoleApprovals?: ProgramRoleDTO[];
  readonly deletable: boolean;
  programPk: number | null;

  public loadFromDTO(dto: ProcedureChangeTypeDTO): this {
    const n: Required<_.Omit<ProcedureChangeType, LocalProperties>> = {
      name: dto.name,
      pk: dto.pk,
      isEnabled: dto.isEnabled,
      acceptsAllSignatures: dto.acceptsAllSignatures,
      description: dto.description,
      requiredRoleApprovals: dto.requiredRoleApprovals,
      deletable: dto.deletable,
      programPk: dto.programPk,
    };
    return _.merge(this, n);
  }
  public asDTO(): ProcedureChangeTypeDTO {
    return {
      name: this.name,
      pk: this.pk,
      isEnabled: this.isEnabled,
      acceptsAllSignatures: this.acceptsAllSignatures,
      description: this.description,
      requiredRoleApprovals: this.requiredRoleApprovals,
      deletable: this.deletable,
      programPk: this.programPk,
    };
  }

}
