import { Injectable } from '@angular/core';
import { StepDef } from '@app/interfaces/step-def.interface';
import { Observable, Subject } from 'rxjs';
import { EPICWSService, Error, httpJsonOptions } from './epic-ws.service';
import { StepDefDTO } from '@app/interfaces/step-def.dto.interface';
import { AppConfigService } from './app-config-service.service';
import { StepTableCell } from '@app/interfaces/step-table-cell';
import { catchError, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { StepTableCellDTO } from '@app/interfaces/step-table-cell.dto';

class StepRunDataRequestBody {
  data: StepDefDTO;
  dataCell?: StepTableCellDTO = null;
}

@Injectable({
  providedIn: 'root'
})
export class RunDataEntryService {
  runStepDefSource = new Subject<StepDef>();

  runStepChanged = this.runStepDefSource.asObservable();

  constructor(private epicWs: EPICWSService,
              private configService: AppConfigService) { }

  saveRunStepValue(_stepData: StepDef, _cell?: StepTableCell): Observable<StepDef & Error> {
    const stepData = _stepData.asDTO();
    const dataCell = _cell ? _cell.asDTO() : null;
    let runDataEntryRequestBody = new StepRunDataRequestBody();
    runDataEntryRequestBody.data = stepData;
    runDataEntryRequestBody.dataCell = dataCell;
    return this.epicWs.http.put<StepDefDTO>(`${this.configService.config.apiUrl}/RunValue/${stepData.type}/`, runDataEntryRequestBody, httpJsonOptions)
      .pipe(catchError(this.epicWs.handleErrorFromWs('saveRunStepValue')))
      .pipe(map((elm: StepDefDTO) => {
        const sd = new StepDef().loadFromDTO(elm);
        sd.setStepGroupDef(elm.stepGroupDef);
        return sd;
      }));
  }

  announceRunStepDefChange(stepDef: StepDef) {
    this.runStepDefSource.next(stepDef);
  }
}
