import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';

export interface UsersDTO {
  userId: number;
  username: string;
  displayName: string;
  lastLogin: number | null;
  pin: string;
  procedureDetails: ProcedureDetailsDTO[];
  email?: string;
  isAdmin: boolean;
}
