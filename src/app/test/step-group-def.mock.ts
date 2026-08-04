import { StepGroupDef } from '@app/interfaces/step-group-def';
import { procedureDetailsLockedRunMock } from './procedure-details.mock';
import * as _ from 'lodash';

export const stepGroupDefMock: StepGroupDef = _.merge(new StepGroupDef(), {
  pk: 0,
  stepGroupName: 'mockStepGroupName',
  description: 'mockDescription',
  displayOrder: 1,
  procedureDetails: procedureDetailsLockedRunMock,
  stepDefs: [],
  stepGroupDefParent: {
    pk: 1,
    stepGroupName: 'mockStepGroupName',
    description: 'mockDescription',
    displayOrder: 0,
    procedureDetails: procedureDetailsLockedRunMock,
  },
  stepGroupDefsChildren: [],
  editType: undefined,
  blackLineComments: [],
  redLineComments: [],
  runCloseoutStickyComments: [],
});
