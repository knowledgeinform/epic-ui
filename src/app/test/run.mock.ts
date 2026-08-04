import { Run } from '@app/interfaces/Run';
import { procedureDetailsLockedRunMock } from './procedure-details.mock';
import { usersMock } from './users.mock';
import { RunStatus } from '@app/interfaces/run-status.dto';
import * as _ from 'lodash';
import {testingPhaseMock} from "@app/test/testing-phase.mock";

export const runMock = new Run();

_.assign(runMock, {
  pk: 0,
  runNumber: 0,
  status: RunStatus.RUNNING,
  user: usersMock,
  name: 'runMockName',
  description: 'runMockDesc',
  equipmentList: [],
  procedureDetails: procedureDetailsLockedRunMock,
  testingPhase: testingPhaseMock,
  attachments: [],
  runApprovals: [],
  createdDate: new Date(),
  closeoutSubmittedDate: new Date(),
  closeoutCompletedDate: new Date(),
  closeoutSubmissionUser: usersMock,
  status_icon: '',
});
