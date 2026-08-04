import {EditType} from './edit-type.dto';
import {ProcedureDetailsDTO} from './procedure-details.dto';
import {BlackLineDto} from './black-line.dto';
import {StepDefDTO} from './step-def.dto.interface';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';

export interface StepGroupDefDTO {
  pk: number;
  stepGroupName?: string;
  description?: string;
  displayOrder?: number;
  procedureDetails?: Partial<ProcedureDetailsDTO>;
  stepDefs?: StepDefDTO[];
  stepGroupDefParent?: StepGroupDefDTO;
  stepGroupDefsChildren?: StepGroupDefDTO[];
  editType?: EditType;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];
}
