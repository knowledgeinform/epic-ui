import {StepGroupDefDTO} from './step-group-def.dto';
import {StepType} from './step-type.dto';
import {EditType} from './edit-type.dto';
import {CommentType} from './comment-type.dto';
import {UsersDTO} from './users.dto';
import {BlackLineDto} from './black-line.dto';
import {EquipmentDTO} from './equipment.dto';
import {MandatoryInspectionSecondSignature, WitnessSecondSignature} from '@app/interfaces/second-signature.dto';
import {CommentDto, RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import {RunStepAttachment, StepDefAttachment} from '@app/interfaces/attachment';
import {History} from '@app/interfaces/history';
import {StepTableRowDTO} from "@app/interfaces/step-table-row.dto";

export interface StepDefDTO {
  pk?: number;
  instructions: string;
  displayOrder: number;
  stepGroupDef?: StepGroupDefDTO;
  stepName: string;
  requireWitness: boolean;
  esd0: boolean;
  hazardous: boolean;
  mandatoryInspection: boolean;
  type: StepType;
  editType: EditType;
  runValue?: boolean | string;
  runValueSavedTimestamp?: Date;
  runValueEntryUser?: UsersDTO;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runStepComments?: RunStepComment[];
  histories?: History[];
  isManualValidation?: boolean;
  allowEquipmentEntry?: boolean;
  equipment?: EquipmentDTO[];
  witnessSecondSignature?: WitnessSecondSignature;
  mandatoryInspectionSecondSignature?: MandatoryInspectionSecondSignature;
  runStepAttachments: RunStepAttachment[];
  stepDefAttachments?: StepDefAttachment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];
}

export class RunStepComment extends CommentDto {
  commentType: CommentType = CommentType.RUN_STEP_COMMENT;
  isNonconformance: boolean = false;
  stepDef: StepDefDTO;
}
