import {TestingPhase} from "./testing-phase.dto";
import {UsersDTO} from "./users.dto";
import {RunStatus} from "./run-status.dto";
import {ProcedureDetailsDTO} from './procedure-details.dto';
import {EquipmentDTO} from './equipment.dto';
import {RunAttachment} from '@app/interfaces/attachment';
import {RunApproval} from '@app/interfaces/run-approval.dto';

export interface RunDTO {
  pk: number;
  runNumber: number;
  status: RunStatus;
  user: UsersDTO;
  name: string;
  description: string;
  equipmentList: EquipmentDTO[];
  procedureDetails: ProcedureDetailsDTO;
  testingPhase: TestingPhase;
  attachments: RunAttachment[];
  runApprovals: RunApproval[];
  createdDate: Date;
  closeoutSubmittedDate: Date;
  closeoutCompletedDate: Date;
  closeoutSubmissionUser: UsersDTO;
}
