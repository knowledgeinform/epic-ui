import { ProcedureApprovalType } from './procedure-approval-type.enum';

export interface ApprovalDashboardDTO {
    id: string;
    pk: number;
    procApprovalType: ProcedureApprovalType;
}
