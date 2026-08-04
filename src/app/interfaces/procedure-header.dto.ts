import {UsersDTO} from './users.dto';
import {ProcedureDetailsDTO} from './procedure-details.dto';
import {Attachment} from '@app/interfaces/attachment';

export class ProcedureHeader {
  pk: number;
  text: string;
  user: UsersDTO;
  creationDate: number; // TODO: Verify whether this come back as a number or Date.
  procedureDetails: ProcedureDetailsDTO;
  submittedForReviewDate: number | null;
  approvedDate: number | null;
  releasedDate: number | null;
  attachments: Attachment[] = [];
}
