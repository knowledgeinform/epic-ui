import { ProcedureDetailsDTO } from '@app/interfaces/procedure-details.dto';
import { ProcedureStatus } from '@app/interfaces/procedure-status.dto';
import { EditType } from '@app/interfaces/edit-type.dto';
import { procedureDefMock } from './procedure-def.mock';
import { procedureHeaderMock } from './procedure-header.mock';
import { procedureApprovalMock, procedureReviewerMock } from './procedure-approval.mock';
import { ProcedureApproval } from '@app/interfaces/procedure-approval.dto';
import * as _ from 'lodash';

export const procedureDetailsDTOLockedRunMock: ProcedureDetailsDTO = {
  pk: 0,
  procedureDefVersion: 0,
  id: 'id',
  status: ProcedureStatus.APPROVED,
  run: null,
  stepGroupDefs: [],
  procedureInstructions: [],
  procedureApprovals: [],
  procedureDef: procedureDefMock,
  procedureHeader: procedureHeaderMock,
  originalProcedureDetails: null,
  procedureDetailRuns: [],
  redlinedVersion: null,
  editType: EditType.LOCKED_RUN,
  runNumber: 0,
  blackLineComments: [],
  redLineComments: [],
  esd0: false,
  hazardous: false,
  hazardDescription: 'mockHazardDescription',
  favoriteUsers: [],
  redliningEnabled: false, // UI only value
  runCloseoutStickyComments: [],
  histories: [],
  procedureApprovalDueDate: ''
};

export const procedureDetailsDTODraft1Mock: ProcedureDetailsDTO = {
  pk: 1,
  procedureDefVersion: 1,
  id: 'id-draft-1',
  status: ProcedureStatus.DRAFT,
  run: null,
  stepGroupDefs: [],
  procedureInstructions: [],
  procedureApprovals: [],
  procedureDef: procedureDefMock,
  procedureHeader: procedureHeaderMock,
  originalProcedureDetails: null,
  procedureDetailRuns: [],
  redlinedVersion: null,
  editType: EditType.ORIGINAL,
  runNumber: 0,
  blackLineComments: [],
  redLineComments: [],
  esd0: false,
  hazardous: false,
  hazardDescription: '',
  favoriteUsers: [],
  redliningEnabled: false, // UI only value
  runCloseoutStickyComments: [],
  histories: []
};

export const procedureDetailsDTODraft2Mock: ProcedureDetailsDTO = {
  pk: 1,
  procedureDefVersion: 1,
  id: 'id-draft-2',
  status: ProcedureStatus.DRAFT,
  run: null,
  stepGroupDefs: [],
  procedureInstructions: [],
  procedureApprovals: [(_.assign(new ProcedureApproval(), procedureReviewerMock))],
  procedureDef: procedureDefMock,
  procedureHeader: procedureHeaderMock,
  originalProcedureDetails: null,
  procedureDetailRuns: [],
  redlinedVersion: null,
  editType: EditType.ORIGINAL,
  runNumber: 0,
  blackLineComments: [],
  redLineComments: [],
  esd0: false,
  hazardous: false,
  hazardDescription: '',
  favoriteUsers: [],
  redliningEnabled: false, // UI only value
  runCloseoutStickyComments: [],
  histories: []
};

export const procedureDetailsDTOInReviewMock: ProcedureDetailsDTO = {
  pk: 1,
  procedureDefVersion: 1,
  id: 'id-review',
  status: ProcedureStatus.WAITING,
  run: null,
  stepGroupDefs: [],
  procedureInstructions: [],
  procedureApprovals: [(_.assign(new ProcedureApproval(), procedureApprovalMock))],
  procedureDef: procedureDefMock,
  procedureHeader: procedureHeaderMock,
  originalProcedureDetails: null,
  procedureDetailRuns: [],
  redlinedVersion: null,
  editType: EditType.ORIGINAL,
  runNumber: 0,
  blackLineComments: [],
  redLineComments: [],
  esd0: false,
  hazardous: false,
  hazardDescription: '',
  favoriteUsers: [],
  redliningEnabled: false, // UI only value
  runCloseoutStickyComments: [],
  histories: []
};
