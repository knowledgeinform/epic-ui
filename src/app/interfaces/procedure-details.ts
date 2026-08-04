import {ProcedureStatus} from './procedure-status.dto';
import {ProcedureDef} from './procedure-def.dto';
import {EditType} from './edit-type.dto';
import {BlackLineDto} from './black-line.dto';
import { ProcedureApproval } from './procedure-approval.dto';
import { ProcedureHeader } from './procedure-header.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import {Run} from '@app/interfaces/Run';
import { StepGroupDef } from './step-group-def';
import { Local, LocalProperties } from './local.class';
import { ProcedureDetailsDTO } from './procedure-details.dto';
import { Users } from './users';
import * as _ from 'lodash';
import { Utils } from '@app/utils';
import { environment } from '../../environments/environment';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';

export class ProcedureDetails extends Local<ProcedureDetailsDTO, ProcedureDetails> {
  pk: number;
  procedureDefVersion: number;
  id: string;
  status: ProcedureStatus;
  run: Run;
  stepGroupDefs: StepGroupDef[];
  procedureInstructions: ProcedureInstruction[];
  procedureApprovals: ProcedureApproval[];
  procedureDef: ProcedureDef;
  procedureHeader: ProcedureHeader;
  originalProcedureDetails: ProcedureDetails | null;
  procedureDetailRuns: ProcedureDetails[];
  redlinedVersion: string | null;
  editType: EditType;
  runNumber: number;
  blackLineComments: BlackLineDto[] = [];
  redLineComments: RedLineComment[] = [];
  esd0: boolean;
  hazardous: boolean;
  hazardDescription: string;
  favoriteUsers: Users[];
  redliningEnabled: boolean | false; // UI only value
  runCloseoutStickyComments: RunCloseoutStickyComment[];
  procedureApprovalDueDate?: Date;
  histories: History[];

  public loadFromDTO(dto: Partial<ProcedureDetailsDTO>) {

    if (!dto) {
      if (!environment.production) {
        console.warn('DTO not provided to load from.');
      }
      return;
    }

    const n: Required<_.Omit<ProcedureDetails, LocalProperties>> = {
      blackLineComments: dto.blackLineComments ? dto.blackLineComments : [],
      editType: dto.editType,
      esd0: dto.esd0,
      favoriteUsers: _.map(dto.favoriteUsers, u => new Users().loadFromDTO(u)),
      hazardDescription: dto.hazardDescription,
      hazardous: dto.hazardous,
      id: dto.id,
      originalProcedureDetails: new ProcedureDetails().loadFromDTO(dto.originalProcedureDetails),
      pk: dto.pk,
      procedureApprovals: dto.procedureApprovals,
      procedureDef: dto.procedureDef,
      procedureDefVersion: dto.procedureDefVersion,
      procedureDetailRuns: _.map(dto.procedureDetailRuns, r => new ProcedureDetails().loadFromDTO(r)),
      procedureHeader: dto.procedureHeader,
      procedureInstructions: _.map(dto.procedureInstructions, i => new ProcedureInstruction().loadFromDTO(i)),
      redLineComments: dto.redLineComments ? dto.redLineComments : [],
      redlinedVersion: dto.redlinedVersion,
      redliningEnabled: dto.redliningEnabled,
      run: new Run().loadFromDTO(dto.run),
      runCloseoutStickyComments: dto.runCloseoutStickyComments,
      runNumber: dto.runNumber,
      status: dto.status,
      stepGroupDefs: _.map(dto.stepGroupDefs, sgd => new StepGroupDef().loadFromDTO(sgd)),
      procedureApprovalDueDate: dto.procedureApprovalDueDate ? new Date(dto.procedureApprovalDueDate) : null,
      histories: dto.histories,
    };
    if (this.run) this.run.setProcedureDetails(this);
    return _.merge(this, n);
  }

  public asDTO() {
    const dto: Required<ProcedureDetailsDTO> = {
      blackLineComments: this.blackLineComments,
      editType: this.editType,
      esd0: this.esd0,
      favoriteUsers: _.map(this.favoriteUsers, u => u.asDTO()),
      hazardDescription: this.hazardDescription,
      hazardous: this.hazardous,
      id: this.id,
      originalProcedureDetails: this.originalProcedureDetails ? this.originalProcedureDetails.asDTO() : null,
      pk: this.pk,
      procedureApprovals: this.procedureApprovals,
      procedureDef: this.procedureDef,
      procedureDefVersion: this.procedureDefVersion,
      procedureDetailRuns: _.map(this.procedureDetailRuns, r => r.asDTO()),
      procedureHeader: this.procedureHeader,
      procedureInstructions: _.map(this.procedureInstructions, inst => inst.asDTO()),
      redLineComments: this.redLineComments,
      redlinedVersion: this.redlinedVersion,
      redliningEnabled: this.redliningEnabled,
      run: this.run ? this.run.asDTO() : null,
      runCloseoutStickyComments: this.runCloseoutStickyComments,
      runNumber: this.runNumber,
      status: this.status,
      stepGroupDefs: _.map(this.stepGroupDefs, sgd => sgd.asDTO()),
      procedureApprovalDueDate: Utils.dateAsJavaString(this.procedureApprovalDueDate),
      histories: this.histories,
    };
    return dto;
  }

}
