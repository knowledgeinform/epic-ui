import { ProcedureHeader } from '@app/interfaces/procedure-header.dto';
import { usersDtoMock } from './users.dto.mock';

export const procedureHeaderMock: ProcedureHeader = {
  pk: 0,
  text: 'abc',
  user: usersDtoMock,
  creationDate: 1,
  procedureDetails: null, // procedureDetailsDTOMock,
  submittedForReviewDate: null,
  approvedDate: null,
  releasedDate: null,
  attachments: [],
}
