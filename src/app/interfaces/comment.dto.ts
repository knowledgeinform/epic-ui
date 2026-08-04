import {CommentType} from '@app/interfaces/comment-type.dto';
import { UsersDTO } from './users.dto';
import {BlackRedLineSignature} from '@app/interfaces/second-signature.dto';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {StepGroupDefDTO} from '@app/interfaces/step-group-def.dto';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import { ProcedureChangeType } from './procedure-change-type';
import { ProcedureChangeTypeDTO } from './procedure-change-type.dto';
import * as _ from 'lodash';

export class CommentDto {
  pk: number;
  commentTimestamp: Date;
  commentText: string;
  commentType: CommentType;
  users: UsersDTO;
  blackRedLineSignatures: BlackRedLineSignature[] | null;

  constructor(comment?: Partial<CommentDto>) {
    _.merge(this, comment);
  }

}

export class RedBlackLineComment extends CommentDto {
  commentText = '';
  procedureDetails: ProcedureDetailsDTO;
  stepGroupDef: StepGroupDefDTO;
  stepDef: StepDefDTO;
  procedureInstruction: ProcedureInstructionDTO;
  procedureChangeType: ProcedureChangeTypeDTO;

  constructor(comment: Partial<RedBlackLineComment> & {procedureDetails: ProcedureDetailsDTO}) {
    super(comment);
  }
}

export class RedLineComment extends RedBlackLineComment {
  commentText = '';
  commentType = CommentType.RED_LINE_COMMENT;

  constructor(comment: Partial<RedLineComment> & {procedureDetails: ProcedureDetailsDTO}) {
    super(comment);
  }
}

export class ApprovalComment extends CommentDto {
  procedureApproval: ProcedureApproval;
  replies: ApprovalCommentReply[];
}

export class ApprovalCommentReply extends CommentDto {
  approvalComment: ApprovalComment;
}

export class RunCloseoutComment extends CommentDto {
  runApproval: RunApproval;
  replies: RunCloseoutCommentReply[];
}

export class RunCloseoutCommentReply extends CommentDto {
  runCloseoutComment: RunCloseoutComment;
}

export class RunCloseoutStickyComment extends CommentDto {
  procedureDetails: ProcedureDetailsDTO;
  stepGroupDef: StepGroupDefDTO;
  stepDef: StepDefDTO;
  procedureInstruction: ProcedureInstructionDTO;
  isComplete: boolean = false;
  commentType = CommentType.RUN_CLOSEOUT_STICKY_COMMENT;
}
