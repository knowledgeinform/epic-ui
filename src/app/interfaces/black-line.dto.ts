import {CommentType} from './comment-type.dto';
import {RedBlackLineComment} from '@app/interfaces/comment.dto';
import { ProcedureDetailsDTO } from './procedure-details.dto';

export class BlackLineDto extends RedBlackLineComment {
  commentType = CommentType.BLACK_LINE_COMMENT;

  constructor(comment: Partial<BlackLineDto> & {procedureDetails: ProcedureDetailsDTO}) {
    super(comment);
  }
}

export enum BlackLineEntityType {
  STEP = 'STEP',
  STEP_GROUP = 'STEP_GROUP',
  PROCEDURE_DETAILS = 'PROCEDURE_DETAILS',
  PROCEDURE_INSTRUCTION = 'PROCEDURE_INSTRUCTION'
}
