import * as _ from 'lodash';
import { Local } from './local.class';
import {FindProcedureDTO} from "@app/interfaces/find-procedure-dto";
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {ProcedureDef} from "@app/interfaces/procedure-def.dto";

export class FindProcedure extends Local<FindProcedureDTO, FindProcedure> {
  procedureDefs?: ProcedureDef[];
  procedureDetails?: ProcedureDetails[];
  numResults: number;

  constructor() { super(); }

  public loadFromDTO(dto: FindProcedureDTO) {
    if (!dto) return this;

    this.loadPropsFrom(dto);
    this.procedureDefs = dto.procedureDefs;
    this.procedureDetails = _.map(dto.procedureDetails, pd => new ProcedureDetails().loadFromDTO(pd));
    this.numResults = dto.numResults;
    return this;
  }

  public asDTO(): FindProcedureDTO {
    return {
      procedureDefs: this.procedureDefs,
      procedureDetails: _.map(this.procedureDetails, pd => pd.asDTO()),
      numResults: this.numResults,
    };
  }

}
