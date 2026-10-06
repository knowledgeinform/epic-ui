export interface ProcedureStatusCounts {
  DRAFT: number;
  WAITING: number;
  APPROVED: number;
  READY: number;
}

export interface RunStatusCounts {
  RUNNING: number;
  REVIEWING: number;
  CORRECTING: number;
  APPROVED: number;
  COMPLETED: number;
  ABANDONED: number;
}

export interface ProgramStatusDTO {
  programPk: number;
  procedureStatusCounts: ProcedureStatusCounts;
  runStatusCounts: RunStatusCounts;
}
