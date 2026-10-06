import { Run } from '@app/interfaces/Run';

export interface RunEditDTO {
  runPk: number;
  name: string;
  description?: string;
}

export interface RunEditResult {
  success: boolean;
  message: string;
  previousName: string;
  previousDescription: string;
  run: Run;
  denialReason?: string;
}
