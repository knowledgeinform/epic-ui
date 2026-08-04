import {UsersDTO} from './users.dto';
import {Approval} from '@app/interfaces/approval';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {ApprovalComment} from '@app/interfaces/comment.dto';

export class ProcedureApproval extends Approval {
  users: UsersDTO;
  comments: ApprovalComment[];
  procedureDetails: ProcedureDetailsDTO;
}
