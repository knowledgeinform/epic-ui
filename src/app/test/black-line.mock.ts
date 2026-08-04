import { CommentType } from "@app/interfaces/comment-type.dto";
import { RedBlackLineComment } from "@app/interfaces/comment.dto";
import { procedureDetailsDTOLockedRunMock } from "./procedure-details-dto.mock";
import { stepDefMock, stepDefMock2 } from "./step-def.mock";
import { usersDtoMock } from "./users.dto.mock";

export const stepBlackLineMockArray: RedBlackLineComment[] = [
    {
        pk: 1,
        commentTimestamp: new Date(),
        commentText: 'This is mock black line 1',
        commentType: CommentType.BLACK_LINE_COMMENT,
        users: usersDtoMock,
        blackRedLineSignatures: null,
        procedureDetails: null,
        stepDef: stepDefMock.asDTO(),
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
    },
    {
        pk: 2,
        commentTimestamp: new Date(),
        commentText: 'This is mock black line 2',
        commentType: CommentType.BLACK_LINE_COMMENT,
        users: usersDtoMock,
        blackRedLineSignatures: null,
        procedureDetails: null,
        stepDef: stepDefMock2.asDTO(),
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
    }
]

export const procedureDataBlackLineMockArray: RedBlackLineComment[] = [
    {
        pk: 1,
        commentTimestamp: new Date(),
        commentText: 'This is mock black line 1',
        commentType: CommentType.BLACK_LINE_COMMENT,
        users: usersDtoMock,
        blackRedLineSignatures: null,
        procedureDetails: procedureDetailsDTOLockedRunMock,
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
    },
    {
        pk: 2,
        commentTimestamp: new Date(),
        commentText: 'This is mock black line 2',
        commentType: CommentType.BLACK_LINE_COMMENT,
        users: usersDtoMock,
        blackRedLineSignatures: null,
        procedureDetails: procedureDetailsDTOLockedRunMock,
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
    }
]