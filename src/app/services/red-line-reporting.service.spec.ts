import { TestBed } from '@angular/core/testing';

import { LineEditReportingService } from './line-edit-reporting.service';
import * as _ from 'lodash';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { stepDefMock } from '@app/test/step-def.mock';
import { stepBlackLineMockArray } from '@app/test/black-line.mock';

describe('RedLineReportingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LineEditReportingService = TestBed.inject(LineEditReportingService);
    expect(service).toBeTruthy();
  });

  it('should keep the Run Activity Summary step blackline count at one after adding a redline to the run', () => {
    const service: LineEditReportingService = TestBed.inject(LineEditReportingService);

    const procedureData = _.cloneDeep(procedureDetailsLockedRunMock);
    procedureData.blackLineComments = [];
    procedureData.redLineComments = [];
    procedureData.procedureInstructions = [];

    const originalStep = _.cloneDeep(stepDefMock);
    originalStep.pk = 101;
    originalStep.displayOrder = 1;
    originalStep.blackLineComments = [_.cloneDeep(stepBlackLineMockArray[0] as any)];

    const redlinedStep = _.cloneDeep(stepDefMock);
    redlinedStep.pk = 202;
    redlinedStep.displayOrder = 1;
    redlinedStep.blackLineComments = [_.cloneDeep(stepBlackLineMockArray[0] as any)];
    redlinedStep.redLineComments = [{ pk: 301 } as any];

    const stepGroup = _.cloneDeep(stepGroupDefMock);
    stepGroup.pk = 501;
    stepGroup.stepDefs = [originalStep, redlinedStep];
    stepGroup.stepGroupDefsChildren = [];
    stepGroup.procedureDetails = procedureData;

    originalStep.stepGroupDef = stepGroup;
    redlinedStep.stepGroupDef = stepGroup;

    procedureData.stepGroupDefs = [stepGroup];

    service.findStepLineEditsForProcedure(procedureData);

    expect(service.stepBlackLines.getLines(procedureData.pk).length).toBe(1);
    expect(service.stepBlackLineCount.getCount(procedureData.pk)).toBe(1);
  });
});
