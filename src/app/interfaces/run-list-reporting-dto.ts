import {ProcedureDetailsReportingDTO} from '@app/interfaces/procedure-details-reporting-dto';
import {UsersDTO} from '@app/interfaces/users.dto';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {TestingPhase} from '@app/interfaces/testing-phase.dto';
import {Run} from '@app/interfaces/Run';
import {ProgramDTO} from '@app/interfaces/program.dto';
import {Subsystem} from '@app/interfaces/subsystem.dto';

export interface RunListReportingDTO extends ProcedureDetailsReportingDTO {
  id: string;
  procedureDefName: string;
  procedureDefVersion: number;
  program: ProgramDTO;
  subsystem: Subsystem;
  createdDate: Date;
  formattedCreatedDate: string;
  url: string;
  runNumber: number;
  run: Run;
  formattedSubmittedDate: string;
  formattedCompletedDate: string;
  sumNonConformance: number;
}
