import { ProcedureApproval } from './procedure-approval.dto';
import { ProcedureDetailsDTO } from './procedure-details.dto';

export interface ApprovalWithProcedureDetails {
  approval: ProcedureApproval;
  procedureDetails: ProcedureDetailsDTO;
}
