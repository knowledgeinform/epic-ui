import { ProcedureDef } from '@app/interfaces/procedure-def.dto';
import { programMock } from './program.mock';
import { subsystemMock } from './subsystem.mock';

export const procedureDefMock: ProcedureDef = {
  pk: 0,
  name: 'mockProcedureDefName',
  description: 'mockDescription',
  procedureDetails: [], // [procedureDetailsDTOMock],
  program: programMock,
  subsystem: subsystemMock,
  procedureApprovalDueDate: 0,
};
