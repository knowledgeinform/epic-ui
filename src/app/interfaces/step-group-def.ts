import {EditType} from './edit-type.dto';
import {ProcedureDetailsDTO} from './procedure-details.dto';
import {BlackLineDto} from './black-line.dto';
import {StepGroupDefDTO} from './step-group-def.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import { StepDef } from './step-def.interface';
import { Local, LocalProperties } from './local.class';
import * as _ from 'lodash';
import { ProcedureDetails } from './procedure-details';
import { environment } from '../../environments/environment';

export class StepGroupDef extends Local<StepGroupDefDTO, StepGroupDef> {
  pk: number;
  stepGroupName?: string;
  description?: string;
  displayOrder?: number;
  procedureDetails?: ProcedureDetails;
  stepDefs?: StepDef[];
  stepGroupDefParent?: StepGroupDef;
  stepGroupDefsChildren?: StepGroupDef[];
  editType?: EditType;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];

  public loadFromDTO(dto: StepGroupDefDTO) {

    if (!dto) {
      if (!environment.production) {
        console.warn('DTO not provided to load from.');
      }
      return;
    }

    const sgd: Required<_.Omit<StepGroupDef, LocalProperties>> = {
      blackLineComments: dto.blackLineComments,
      description: dto.description,
      displayOrder: dto.displayOrder,
      editType: dto.editType,
      pk: dto.pk,
      procedureDetails: dto.procedureDetails ? new ProcedureDetails().loadFromDTO(dto.procedureDetails) : null,
      redLineComments: dto.redLineComments,
      runCloseoutStickyComments: dto.runCloseoutStickyComments,
      stepDefs: _.map(dto.stepDefs, def => {
        const sd = new StepDef().loadFromDTO(def);
        sd.stepGroupDef = this;
        return sd;
      }),
      stepGroupDefParent: dto.stepGroupDefParent ? new StepGroupDef().loadFromDTO(dto.stepGroupDefParent) : null,
      stepGroupDefsChildren: _.map(dto.stepGroupDefsChildren, group => {
        const child = new StepGroupDef().loadFromDTO(group);
        child.setStepGroupDefParent(this);
        return child;
      }),
      stepGroupName: dto.stepGroupName,
      setStepGroupDefParent: this.setStepGroupDefParent,
      addStepDef: this.addStepDef,
    };
    return _.merge(this, sgd);
  }

  /**
   * Adds a step def to the list of step defs. If a step def with this PK already exists, it is replaced by the new object.
   */
  public addStepDef(stepDef: StepDef) {
    const index = _.findIndex(this.stepDefs, sd => sd.pk == stepDef.pk);
    if (index !== -1)
      this.stepDefs.splice(index, 1, stepDef);
    else
      this.stepDefs.push(stepDef);
  }

  public asDTO() {
    const dto: Required<StepGroupDefDTO> = {
      blackLineComments: this.blackLineComments,
      description: this.description,
      displayOrder: this.displayOrder,
      editType: this.editType,
      pk: this.pk,
      procedureDetails: this.procedureDetails ? { pk: this.procedureDetails.pk } : null,
      redLineComments: this.redLineComments,
      runCloseoutStickyComments: this.runCloseoutStickyComments,
      stepDefs: _.map(this.stepDefs, sd => sd.asDTO()),
      stepGroupDefParent: this.stepGroupDefParent ? { pk: this.stepGroupDefParent.pk } : null,
      stepGroupDefsChildren: _.map(this.stepGroupDefsChildren, def => def.asDTO()),  // TODO: Verify this doesn't go infinite due to back-references.
      stepGroupName: this.stepGroupName,
    };
    return dto;
  }

  public setStepGroupDefParent(parent: StepGroupDef) {
    this.stepGroupDefParent = parent;
  }


}

export class StepGroupMoveDisplay extends StepGroupDef {
  selectDisplayName: string;
}
