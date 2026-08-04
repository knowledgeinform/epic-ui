import {Injectable} from '@angular/core';
import {EPICWSService, ErrMsg} from "@app/services/epic-ws.service";
import {FindProcedure} from "@app/interfaces/find-procedure";
import {ProcedureDef} from "@app/interfaces/procedure-def.dto";
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {ProcedureRevisionService} from "@app/services/procedure-revision.service";
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private epicWs: EPICWSService, private revisionService: ProcedureRevisionService) { }

  generateSearchParameters(
    searchText: any[],
    programSelection: number,
    subsystemSelection: number,
    testingPhaseSelection: number,
    editTypeSelection: string,
    searchStatusType: string,
    searchOffset: number,
    searchLimit: number
  ): string {
    // if all fields are empty/not selected, return empty
    if ((searchText === undefined) &&
      (programSelection === undefined || programSelection === null || programSelection === -1) &&
      (subsystemSelection === undefined || subsystemSelection === null || subsystemSelection === -1) &&
      (testingPhaseSelection === undefined || testingPhaseSelection === null || testingPhaseSelection === -1)) {
      return '';
    }

    // Generate search parameters string
    let addSearchStatus = false;
    let searchParameters = 'searchText=';
    if (!_.isNil(searchText)) {
      searchParameters += searchText;
    }
    searchParameters += '&program=';
    if (!_.isNil(programSelection) && programSelection !== -1) {
      searchParameters += programSelection;
    }
    searchParameters += '&subsystem=';
    if (!_.isNil(subsystemSelection) && subsystemSelection !== -1) {
      searchParameters += subsystemSelection;
    }
    searchParameters += '&phase=';
    if (!_.isNil(testingPhaseSelection) && testingPhaseSelection !== -1) {
      searchParameters += testingPhaseSelection;
    }
    searchParameters += '&editType=' +
      (_.isNil(editTypeSelection) ? 'ORIGINAL' : editTypeSelection);

    searchParameters += '&procedureStatus=';
    if (!_.isNil(searchStatusType) && searchStatusType !== 'ALL') {
      searchParameters += searchStatusType;
    }

    // Set offset and limit for search
    searchParameters += '&offSetResults=' + searchOffset;
    searchParameters += '&limitResults=' + searchLimit;
    return searchParameters;
  }

  searchForProcedure(
    editTypeSelection: string,
    searchParameters: string
  ): Promise<FindProcedure> & ErrMsg {

    // Call HTTP request to get results
    return this.epicWs.getProcedureSearchResults(searchParameters).toPromise();
  }

  searchForProcedureDef(
    editTypeSelection: string,
    searchParameters: string
  ): Promise<FindProcedure> & ErrMsg {

    // Call HTTP request to get results
    return this.epicWs.getProcedureDefSearchResults(searchParameters).toPromise();
  }

  filterDefsForLatestRevisions(procedureDefs: ProcedureDef[]): ProcedureDetails[] {
    let latestRevisions = [];
    procedureDefs.forEach(pDef => {
      let pd = new ProcedureDetails().loadFromDTO(this.revisionService.getLatestRevision(pDef));
      if (this.revisionService.checkIsLatestReleasedRevision(pd.procedureDefVersion, pDef)) {
        // set the definition
        pd.procedureDef = pDef;
        latestRevisions.push(pd);
      }
    });
    return latestRevisions;
  }


}
