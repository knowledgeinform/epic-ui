import {RunStepComment} from '@app/interfaces/step-def.dto.interface';
import { StepDef } from './step-def.interface';

export class NonConformance {
  step: StepDef;
  nonconformanceComments: RunStepComment[];
  displayNameAndOrder: string;

  constructor(step: StepDef, comments: RunStepComment[]) {
    this.step = step;
    this.nonconformanceComments = comments;
  }
}
