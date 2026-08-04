import { ApprovalDashboardDTO } from './ApprovalDashboardDTO';
import { RunStatus } from './run-status.dto';

export interface RunApprovalDashboardDTO extends ApprovalDashboardDTO {
  runName: string;
  runStatus: RunStatus;
}
