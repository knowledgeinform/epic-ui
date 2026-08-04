import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {EditType} from '@app/interfaces/edit-type.dto';
import {BlackLineDto} from '@app/interfaces/black-line.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';

export interface ProcedureInstructionDTO {
  pk: number;
  sectionName: string;
  displayOrder: number;
  text: string;
  procedureDetails: Partial<ProcedureDetailsDTO>;
  editType: EditType;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];
}
