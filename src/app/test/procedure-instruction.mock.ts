import { EditType } from '@app/interfaces/edit-type.dto';
import { procedureDetailsDTOLockedRunMock } from './procedure-details-dto.mock';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';

export const procedureInstructionMock: ProcedureInstructionDTO = {
  pk: 0,
  sectionName: 'procedureInstructionMockName',
  displayOrder: 0,
  text: 'abc',
  procedureDetails: procedureDetailsDTOLockedRunMock,
  editType: EditType.ORIGINAL,
  blackLineComments: [],
  redLineComments: [],
  runCloseoutStickyComments: [],
}
