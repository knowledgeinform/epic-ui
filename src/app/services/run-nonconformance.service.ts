import { Injectable } from '@angular/core';
import {NonConformance} from '@app/interfaces/non-conformance';
import * as _ from 'lodash';
import {Utils} from '@app/utils';
import { Run } from '@app/interfaces/Run';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class RunNonconformanceService {

  public runNonconformances: {
    [runId: number]: NonConformance[]
  } = {};

  constructor(
    private loggerService: LoggerService,
  ) { }

  /**
   * @param run A run to get nonconformances for.
   * @returns A list of all nonconformances comments, grouped by step.
   * TODO: The `NonConformance` interface would be unnecessary if each comment correctly referenced its StepDef; then we could return RunStepComment[][].
   */
  public findNonConformancesInProcedure(run: Run): NonConformance[] {
    if (!run) { this.loggerService.error('Missing run parameter'); return []; }
    let nonconformanceArray: NonConformance[] = _.chain(Utils.getAllStepsInRun(run))
      .map(step => !step.runStepComments || !step.runStepComments.some(comment => comment.isNonconformance) ? null : new NonConformance(
        _.clone(step),
        step.runStepComments.filter(c => c.isNonconformance),
      ))
      .compact()
      .value();

    // Remove duplicates based on step.pk
    nonconformanceArray =   _.uniqBy(nonconformanceArray, (elem) =>elem.step.pk); 
    this.runNonconformances[run.pk] = nonconformanceArray; 

    return nonconformanceArray;
  }
}
