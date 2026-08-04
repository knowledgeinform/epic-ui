import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';
import {RedLineComment} from '@app/interfaces/comment.dto';
import { StepGroupDefDTO } from './step-group-def.dto';

export class RedLine {
  procedureDetailsPk: number;
  stepGroupDef: StepGroupDefDTO | null;
  stepDef: StepDefDTO | null;
  procedureInstruction: ProcedureInstructionDTO | null;
  redLineComment: RedLineComment;
  stepDefList: StepDefDTO[] | null;
  instructionPkList: number[] | null;
  stepGroupDefList: StepGroupDefDTO[] | null;
}
