import {UsersDTO} from '@app/interfaces/users.dto';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {CommentDto} from '@app/interfaces/comment.dto';
import { ProgramRoleDTO } from './program-role.dto';

export class SecondSignature {
  pk: number;
  timestamp: Date;
  type: SecondSignatureType;
  user: UsersDTO;
}

export class RunStepSecondSignature extends SecondSignature {
  stepDef: StepDefDTO;
}

export class WitnessSecondSignature extends RunStepSecondSignature {
}

export class MandatoryInspectionSecondSignature extends RunStepSecondSignature {
}

export class BlackRedLineSignature extends SecondSignature {
  comment: CommentDto;
  programRole: ProgramRoleDTO;
}
export interface ProcedurePkSignature {
  procedurePk: number, 
  signature: BlackRedLineSignature
 }

export enum SecondSignatureType {
  WITNESS = 'WITNESS',
  MANDATORY_INSPECTION = 'MANDATORY_INSPECTION',
  BLACK_RED_LINE = 'BLACK_RED_LINE'
}
