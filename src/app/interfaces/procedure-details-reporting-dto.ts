import {ProgramDTO} from '@app/interfaces/program.dto';
import {Subsystem} from '@app/interfaces/subsystem.dto';
import {UsersDTO} from '@app/interfaces/users.dto';

export interface ProcedureDetailsReportingDTO {
  id: string;
  procedureDefName: string;
  procedureDefVersion: number;
  program: ProgramDTO;
  subsystem: Subsystem;
  author: UsersDTO;
  createdDate: Date;
  url: string;
}
