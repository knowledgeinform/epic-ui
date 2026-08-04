import {TestingPhase} from "./testing-phase.dto";
import {Users} from "./users";
import {RunStatus} from "./run-status.dto";
import {RunDTO} from './run.dto';
import * as _ from 'lodash';
import {Equipment} from './equipment';
import {Local, LocalProperties} from './local.class';
import {RunAttachment} from '@app/interfaces/attachment';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import { ProcedureDetails } from './procedure-details';

export class Run extends Local<RunDTO, Run> {
  pk: number = null;
  runNumber: number = null;
  status: RunStatus = null;
  user: Users = null;
  name: string = null;
  description: string = null;
  equipmentList: Equipment[] = null;
  procedureDetails: ProcedureDetails = null;
  testingPhase: TestingPhase = null;
  attachments: RunAttachment[] = [];
  runApprovals: RunApproval[] = [];
  createdDate: Date = null;
  closeoutSubmittedDate: Date = null;
  closeoutCompletedDate: Date = null;
  closeoutSubmissionUser: Users = null;

  // Unique UI values
  status_icon: string = null;

  constructor() { super(); }

  /**
   * Note: `procedureDetails` may need to be set manually, if it is not defined at the time this loads.
   */
  public loadFromDTO(dto: RunDTO) {

    if (!dto) {
      console.warn('Could not create DTO from null.');
      return;
    }

    const n: Required<_.Omit<Run, LocalProperties>> = {
      attachments: dto.attachments,
      closeoutCompletedDate: dto.closeoutCompletedDate,
      closeoutSubmissionUser: new Users().loadFromDTO(dto.closeoutSubmissionUser),
      closeoutSubmittedDate: dto.closeoutSubmittedDate,
      createdDate: dto.createdDate,
      description: dto.description,
      equipmentList: _.map(dto.equipmentList, (e) => new Equipment().loadFromDTO(e)),
      name: dto.name,
      pk: dto.pk,
      procedureDetails: dto.procedureDetails ? new ProcedureDetails().loadFromDTO(dto.procedureDetails) : null,
      runApprovals: dto.runApprovals,
      runNumber: dto.runNumber,
      status: dto.status,
      status_icon: null,
      testingPhase: dto.testingPhase,
      user: new Users().loadFromDTO(dto.user),
      setProcedureDetails: this.setProcedureDetails,
    };
    _.merge(this, n);

    if (this.procedureDetails) this.updateOfflineAvailabilityAsync(`/Runs/Run/${this.procedureDetails.id}`);

    return this;
  }

  public asDTO(): RunDTO {
    const dto: Required<RunDTO> = {
      attachments: this.attachments,
      closeoutCompletedDate: this.closeoutCompletedDate,
      closeoutSubmissionUser: this.closeoutSubmissionUser.asDTO(),
      closeoutSubmittedDate: this.closeoutSubmittedDate,
      createdDate: this.createdDate,
      description: this.description,
      equipmentList: _.map(this.equipmentList, (e) => e.asDTO()),
      name: this.name,
      pk: this.pk,
      procedureDetails: _.isNil(this.procedureDetails.run) ? this.procedureDetails.asDTO() : null,
      runApprovals: this.runApprovals,
      runNumber: this.runNumber,
      status: this.status,
      testingPhase: this.testingPhase,
      user: this.user.asDTO(),
    }
    return dto;
  }

  /**
   * Should be called after loading ProcedureDetails from a DTO
   */
  public setProcedureDetails(pd: ProcedureDetails) {
    this.procedureDetails = pd;
    this.updateOfflineAvailabilityAsync(`/Runs/Run/${this.procedureDetails.id}`);
  }

}
