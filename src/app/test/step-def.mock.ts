import { StepType } from '@app/interfaces/step-type.dto';
import { EditType } from '@app/interfaces/edit-type.dto';
import { StepDef } from '@app/interfaces/step-def.interface';
import * as _ from 'lodash';
import { stepGroupDefMock } from './step-group-def.mock';
import { StepTableRow } from '@app/interfaces/step-table-row';

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

const secondDefaults: Partial<StepDef> ={
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
}

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
    _.merge(new StepTableRow(1),
      {
        pk: 0,
        stepTableCells: [
          {
            pk: 0,
            cellIndex: 0,
            editable: true,
            nonEditableValue: '',
            optional: false,
            summerNoteEnabled: true
          },
        ]    
      }),
    ]
}

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

export const stepDefMock: StepDef = _.merge(new StepDef(), defaults);
export const stepDefMock2: StepDef = _.merge(new StepDef(), secondDefaults);
export const stepDefMock3: StepDef = _.merge(new StepDef, thirdDefaults);
export const stepDefMock4: StepDef = _.merge(new StepDef(), fourthDefaults);