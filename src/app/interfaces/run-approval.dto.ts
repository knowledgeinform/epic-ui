import {Run} from '@app/interfaces/Run';
import {Users} from '@app/interfaces/users';
import {Approval} from '@app/interfaces/approval';
import {RunCloseoutComment} from '@app/interfaces/comment.dto';

export class RunApproval extends Approval {
  users: Users;
  run: Run;
  comments: RunCloseoutComment[];
  approverOrder: number;
  dueDate: Date | null;
}
