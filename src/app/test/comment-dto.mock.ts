import {RedBlackLineComment} from '@app/interfaces/comment.dto';
import { CommentType } from '@app/interfaces/comment-type.dto';
import { usersDtoMock } from './users.dto.mock';
import { procedureDetailsLockedRunMock } from './procedure-details.mock';

export const commentDtoMock: RedBlackLineComment = {
  pk: 0,
  commentTimestamp: new Date(),
  commentText: '',
  commentType: CommentType.APPROVAL_COMMENT,
  users: usersDtoMock,
  blackRedLineSignatures: null,
  procedureDetails: procedureDetailsLockedRunMock.asDTO(),
  stepDef: null,
  stepGroupDef: null,
  procedureInstruction: null,
  procedureChangeType: {
    name: 'test',
    pk: 1,
    isEnabled: true,
    acceptsAllSignatures: false,
    description: 'test description',
    deletable: false,
    programPk: null,
  }
};
