import { ProcedureApproval } from '@app/interfaces/procedure-approval.dto';
import { ApprovalType } from '@app/interfaces/approval';
import { usersDtoMock } from './users.dto.mock';
import { procedureDetailsDTODraft2Mock, procedureDetailsDTOInReviewMock} from './procedure-details-dto.mock';
import * as _ from 'lodash';

export const procedureReviewerMock: Partial<ProcedureApproval> = {
  pk: 0,
  approvalType: ApprovalType.REVIEWER,
  isApproved: false,
  lastReminderDate: new Date(),
  users: usersDtoMock,
  comments: [],
  approverDisabled: false,
};

export const procedureApprovalMock: Partial<ProcedureApproval> = {
  pk: 0,
  approvalType: ApprovalType.APPROVER,
  isApproved: false,
  lastReminderDate: new Date(),
  users: usersDtoMock,
  comments: [],
  approverDisabled: false,
};