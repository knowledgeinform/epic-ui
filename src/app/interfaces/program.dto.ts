import { ProgramRoleDTO } from './program-role.dto';

export interface ProgramDTO {
  pk: number;
  name: string;
  shortName: string;
  code: string;
  requiredProgramRoles: ProgramRoleDTO[];
}
