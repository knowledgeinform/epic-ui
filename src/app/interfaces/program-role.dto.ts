import { ProcedureChangeTypeDTO } from './procedure-change-type.dto';

export interface ProgramRoleDTO {
  pk: number;
  name: string;
  changeTypesRequiredFor?: ProcedureChangeTypeDTO[];
  blackRedLineSignatures: [];
  deletable: boolean;
  programPk: number | null;
  bypassValidation: boolean;
}
