export abstract class Approval {
  pk: number;
  approvalType: ApprovalType;
  isApproved: boolean = false;
  approverDisabled: boolean = false;
  lastReminderDate: Date;
}

export enum ApprovalType {
  REVIEWER = 'REVIEWER',
  APPROVER = 'APPROVER'
}
