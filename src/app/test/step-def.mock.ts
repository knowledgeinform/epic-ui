import { EditType } from '@app/interfaces/edit-type.dto';
import { StepDef } from '@app/interfaces/step-def.interface';
import { StepTableCell } from '@app/interfaces/step-table-cell';
import { StepTableRow } from '@app/interfaces/step-table-row';
import { StepType } from '@app/interfaces/step-type.dto';
import * as _ from 'lodash';
import { stepGroupDefMock } from './step-group-def.mock';

const defaults: Partial<StepDef> = {
  pk: 0,
  displayOrder: 1,
  esd0: false,
  hazardous: false,
  instructions: 'mockInstructions',
  mandatoryInspection: false,
  requireWitness: false,
  stepName: 'mockStepName',
  type: StepType.CHECKBOX,
  runStepAttachments: [],
  editType: EditType.ORIGINAL,
  stepGroupDef: stepGroupDefMock,
  blackLineComments: []
};

const secondDefaults: Partial<StepDef> = {
  pk: 1,
  displayOrder: 2,
  esd0: false,
  hazardous: true,
  instructions: 'mockInstructions',
  mandatoryInspection: false,
  requireWitness: false,
  stepName: 'mockStepName',
  type: StepType.CHECKBOX,
  runStepAttachments: [],
  editType: EditType.RUN,
  stepGroupDef: stepGroupDefMock,
  blackLineComments: [],
  runValueSavedTimestamp: null,
  runValue: null
};

const thirdDefaults: Partial<StepDef> = {
  pk: 2,
  displayOrder: 3,
  esd0: false,
  hazardous: true,
  instructions: 'mockInstructions',
  mandatoryInspection: false,
  requireWitness: false,
  stepName: 'mockStepName',
  type: StepType.TABLE,
  runStepAttachments: [],
  editType: EditType.RUN,
  stepGroupDef: stepGroupDefMock,
  blackLineComments: [],
  runValueSavedTimestamp: null,
  stepTableRows: [
    _.merge(
      new StepTableRow(1),
      {
        pk: 0,
        stepTableCells: [
          _.merge(
            new StepTableCell(0, ''),
            {
              pk: 0,
              editable: true,
              optional: false,
              summerNoteEnabled: true
            }
          )
        ]
      }
    )
  ]
};

const fourthDefaults: Partial<StepDef> = {
  pk: 0,
  displayOrder: 1,
  esd0: false,
  hazardous: false,
  instructions: 'mockInstructions',
  mandatoryInspection: true,
  requireWitness: true,
  stepName: 'mockStepName',
  type: StepType.CHECKBOX,
  runStepAttachments: [],
  editType: EditType.ORIGINAL,
  stepGroupDef: stepGroupDefMock,
  blackLineComments: [],
  witnessSecondSignature: null,
  mandatoryInspectionSecondSignature: null
};

/**
 * Factory helpers should be preferred by tests that mutate their input data.
 * Each call returns a new StepDef object instead of sharing a singleton
 * between specs.
 */
export function createStepDefMock(): StepDef {
  return _.merge(new StepDef(), _.cloneDeep(defaults));
}

export function createStepDefMock2(): StepDef {
  return _.merge(new StepDef(), _.cloneDeep(secondDefaults));
}

export function createStepDefMock3(): StepDef {
  return _.merge(new StepDef(), _.cloneDeep(thirdDefaults));
}

export function createStepDefMock4(): StepDef {
  return _.merge(new StepDef(), _.cloneDeep(fourthDefaults));
}

/**
 * Keep the existing exports for compatibility with specs that already import
 * these constants. New/updated tests should prefer the factory functions above.
 */
export const stepDefMock: StepDef = createStepDefMock();
export const stepDefMock2: StepDef = createStepDefMock2();
export const stepDefMock3: StepDef = createStepDefMock3();
export const stepDefMock4: StepDef = createStepDefMock4();