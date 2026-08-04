import {ProcedureDetailsDTO} from "@app/interfaces/procedure-details.dto";
import {ProcedureDef} from "@app/interfaces/procedure-def.dto";

export interface FindProcedureDTO {
  procedureDefs: ProcedureDef[];
  procedureDetails: ProcedureDetailsDTO[];
  numResults: number;
}
