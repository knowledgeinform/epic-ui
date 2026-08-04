import {RunStatus} from '@app/interfaces/run-status.dto';
import {UsersDTO} from '@app/interfaces/users.dto';

export interface RunDashboardDTO {
  procedureDetailsPk: number;
  id: string;
  runNumber: number;
  procedureDefVersion: number;
  runName: String;
  favoriteUsers: UsersDTO[];
  status: RunStatus;
}
