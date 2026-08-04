import { Local, LocalProperties } from './local.class';
import { ProcedureChangeTypeDTO } from './procedure-change-type.dto';
import { ProgramRoleDTO } from './program-role.dto';
import * as _ from 'lodash';

export class ProgramRole extends Local<ProgramRoleDTO, ProgramRole> {

  pk: number;
  name: string;
  changeTypesRequiredFor?: ProcedureChangeTypeDTO[];
  blackRedLineSignatures: [];
  readonly deletable: boolean;
  programPk: number | null;
  bypassValidation: boolean = true;

  public loadFromDTO(dto: ProgramRoleDTO): this {
    const n: Required<_.Omit<ProgramRole, LocalProperties>> = {
      name: dto.name,
      pk: dto.pk,
      changeTypesRequiredFor: dto.changeTypesRequiredFor,
      blackRedLineSignatures: dto.blackRedLineSignatures,
      deletable: dto.deletable,
      programPk: dto.programPk,
      bypassValidation: dto.bypassValidation,
    };
    return _.merge(this, n);
  }

  public asDTO(): ProgramRoleDTO {
    return {
      name: this.name,
      pk: this.pk,
      changeTypesRequiredFor: this.changeTypesRequiredFor,
      blackRedLineSignatures: this.blackRedLineSignatures,
      deletable: this.deletable,
      programPk: this.programPk,
      bypassValidation: this.bypassValidation,
    };
  }
}
