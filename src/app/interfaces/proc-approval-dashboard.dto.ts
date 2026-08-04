import { ProcedureStatus } from './procedure-status.dto';
import { ApprovalDashboardDTO } from './ApprovalDashboardDTO';

export interface ProcApprovalDashboardDTO extends ApprovalDashboardDTO {
    procName: string;
    procStatus: ProcedureStatus;
}
