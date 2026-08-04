import { ProcApprovalDashboardDTO } from './proc-approval-dashboard.dto';
import { RunApprovalDashboardDTO } from './run-approval-dashboard.dto';

export interface AllApprovalsDTO {
  procedureApprovals: ProcApprovalDashboardDTO[];
  closeoutApprovals: RunApprovalDashboardDTO[];
}
