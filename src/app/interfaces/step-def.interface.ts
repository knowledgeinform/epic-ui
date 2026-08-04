import {RunStepComment, StepDefDTO} from './step-def.dto.interface';
import {StepGroupDef} from './step-group-def';
import {StepType} from './step-type.dto';
import {EditType} from './edit-type.dto';
import {BlackLineDto} from './black-line.dto';
import {MandatoryInspectionSecondSignature, WitnessSecondSignature} from '@app/interfaces/second-signature.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import {RunStepAttachment, StepDefAttachment} from '@app/interfaces/attachment';
import {Users} from './users';
import {Local, LocalProperties} from './local.class';
import * as _ from 'lodash';
import {Equipment} from './equipment';
import {StepGroupDefDTO} from './step-group-def.dto';
import {History} from './history';
import {ProcedureDetails} from './procedure-details';
import {StepTableRow} from "@app/interfaces/step-table-row";

export class StepDef extends Local<StepDefDTO, StepDef> {

  pk?: number;
  instructions: string;
  displayOrder: number;
  stepGroupDef?: StepGroupDef;
  stepName: string;
  requireWitness: boolean;
  esd0: boolean;
  hazardous: boolean;
  mandatoryInspection: boolean;
  type: StepType;
  editType: EditType;
  runValue?: boolean | string;
  runValueSavedTimestamp?: Date;
  runValueEntryUser?: Users;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runStepComments?: RunStepComment[] = [];
  stepTableRows?: StepTableRow[];  // not present on the backend, but is present on the frontend.
  histories?: History[];
  isManualValidation?: boolean;
  allowEquipmentEntry?: boolean;
  equipment?: Equipment[];
  witnessSecondSignature?: WitnessSecondSignature;
  mandatoryInspectionSecondSignature?: MandatoryInspectionSecondSignature;
  runStepAttachments: RunStepAttachment[];
  stepDefAttachments?: StepDefAttachment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];

  /**
   * Note that `stepGroupDef` must be set manually.
   */
  public loadFromDTO(dto: StepDefDTO) {

    const sd: Required<_.Omit<StepDef, LocalProperties>> = {
      displayOrder: dto.displayOrder,
      editType: dto.editType,
      esd0: dto.esd0,
      hazardous: dto.hazardous,
      instructions: dto.instructions,
      mandatoryInspection: dto.mandatoryInspection,
      requireWitness: dto.requireWitness,
      runStepAttachments: dto.runStepAttachments,
      stepName: dto.stepName,
      allowEquipmentEntry: dto.allowEquipmentEntry,
      type: dto.type,
      blackLineComments: dto.blackLineComments,
      equipment: _.map(dto.equipment, e => new Equipment().loadFromDTO(e)),
      isManualValidation: dto.isManualValidation,
      mandatoryInspectionSecondSignature: dto.mandatoryInspectionSecondSignature,
      redLineComments: dto.redLineComments,
      runCloseoutStickyComments: dto.runCloseoutStickyComments,
      runStepComments: dto.runStepComments,
      histories: dto.histories,
      pk: dto.pk,
      runValue: dto.runValue,
      runValueEntryUser: new Users().loadFromDTO(dto.runValueEntryUser),
      runValueSavedTimestamp: dto.runValueSavedTimestamp,
      stepDefAttachments: dto.stepDefAttachments,
      stepGroupDef: null,  // Null to avoid infinite recursive conversion.
      stepTableRows: dto.type === StepType.TABLE ? _.map(dto['stepTableRows'], row => new StepTableRow(row.rowNumber).loadFromDTO(row)) : null,
      witnessSecondSignature: dto.witnessSecondSignature,
      setStepGroupDef: this.setStepGroupDef,
      getParentProcedureDetails: this.getParentProcedureDetails,
    };
    return _.merge(this, sd);
  }

  /**
   * Sets the step def in this, and on the associated group.
   */
  public setStepGroupDef(sgd: StepGroupDefDTO) {
    if (!sgd) return;
    this.stepGroupDef = new StepGroupDef().loadFromDTO(sgd);
    this.stepGroupDef.addStepDef(this); // Ensure group's object reference points to this.
  }

  public asDTO(): StepDefDTO {
    const dto: Required<StepDefDTO> = {
      displayOrder: this.displayOrder,
      editType: this.editType,
      esd0: this.esd0,
      hazardous: this.hazardous,
      instructions: this.instructions,
      mandatoryInspection: this.mandatoryInspection,
      requireWitness: this.requireWitness,
      runStepAttachments: this.runStepAttachments,
      stepName: this.stepName,
      type: this.type,
      allowEquipmentEntry: this.allowEquipmentEntry,
      blackLineComments: this.blackLineComments,
      equipment: _.map(this.equipment, e => e.asDTO()),
      isManualValidation: this.isManualValidation,
      mandatoryInspectionSecondSignature: this.mandatoryInspectionSecondSignature,
      pk: this.pk,
      redLineComments: this.redLineComments,
      runCloseoutStickyComments: this.runCloseoutStickyComments,
      runStepComments: this.runStepComments,
      histories: this.histories,
      runValue: this.runValue,
      runValueEntryUser: this.runValueEntryUser ? this.runValueEntryUser.asDTO() : null,
      runValueSavedTimestamp: this.runValueSavedTimestamp,
      stepDefAttachments: this.stepDefAttachments,
      stepGroupDef: this.stepGroupDef ? { pk: this.stepGroupDef.pk } : null,
      witnessSecondSignature: this.witnessSecondSignature,
    };

    if (dto.type === StepType.TABLE) {
      dto['stepTableRows'] = _.map(this.stepTableRows, row => row.asDTO());
    }
    return dto;
  }

  public getParentProcedureDetails(): ProcedureDetails {
    let parentGroup: StepGroupDef = this.stepGroupDef;
		while (parentGroup.stepGroupDefParent != null) {
			parentGroup = parentGroup.stepGroupDefParent;
		}
		return parentGroup.procedureDetails;
  }

}
