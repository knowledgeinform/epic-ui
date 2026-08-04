import {Subsystem} from "./subsystem.dto";
import {ProgramDTO} from "./program.dto";
import {ProcedureDetailsDTO} from './procedure-details.dto';

export interface ProcedureDef {
  pk: number;
  name: string;
  description: string;
  procedureDetails: ProcedureDetailsDTO[];
  program: ProgramDTO;
  subsystem: Subsystem;
  procedureApprovalDueDate: number;
}
