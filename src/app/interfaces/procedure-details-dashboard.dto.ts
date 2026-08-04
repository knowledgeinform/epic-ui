import {ProcedureStatus} from './procedure-status.dto';
import {UsersDTO} from '@app/interfaces/users.dto';

export interface ProcedureDetailsDashboard {
  procedureDetailsPk: number;
  procedureDefPk: number;
  id: string;
  procedureDefVersion: number;
  procedureDefName: String;
  status: ProcedureStatus;
  favoriteUsers: UsersDTO[];
  latestReleasedRevision: boolean;
}
