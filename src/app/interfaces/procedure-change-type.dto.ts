import { ProgramRoleDTO } from './program-role.dto';

export interface ProcedureChangeTypeDTO {
  pk: number;
  name: string;
  isEnabled: boolean;
  acceptsAllSignatures: boolean;
  description: string;
  requiredRoleApprovals?: ProgramRoleDTO[];
  deletable: boolean;
  programPk: number | null;
}
