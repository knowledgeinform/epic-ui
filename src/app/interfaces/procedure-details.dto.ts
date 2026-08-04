import {ProcedureStatus} from './procedure-status.dto';
import {ProcedureDef} from './procedure-def.dto';
import {RunDTO} from './run.dto';
import {EditType} from './edit-type.dto';
import {BlackLineDto} from './black-line.dto';
import {UsersDTO} from '@app/interfaces/users.dto';
import { ProcedureApproval } from './procedure-approval.dto';
import { ProcedureHeader } from './procedure-header.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import { StepGroupDefDTO } from './step-group-def.dto';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';

export interface ProcedureDetailsDTO {
  pk: number;
  procedureDefVersion: number;
  id: string;
  status: ProcedureStatus;
  run: RunDTO;
  stepGroupDefs: StepGroupDefDTO[];
  procedureInstructions: ProcedureInstructionDTO[];
  procedureApprovals: ProcedureApproval[];
  procedureHeader: ProcedureHeader;
  procedureDef: ProcedureDef;
  originalProcedureDetails: ProcedureDetailsDTO | null;
  procedureDetailRuns: ProcedureDetailsDTO[];
  redlinedVersion: string | null;
  editType: EditType;
  runNumber: number;
  blackLineComments: BlackLineDto[] | null;
  redLineComments: RedLineComment[] | null;
  hazardous: boolean;
  esd0: boolean;
  hazardDescription: string;
  procedureApprovalDueDate?: string; // Date.
  favoriteUsers: UsersDTO[];
  redliningEnabled: boolean | false; // UI only value
  runCloseoutStickyComments: RunCloseoutStickyComment[];
  histories: History[];
}
