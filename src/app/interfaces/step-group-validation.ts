import { RecursiveValidation, ErrorSet } from './recursive-validation';
import { StepGroupDef } from './step-group-def';
import * as _ from 'lodash';
import { StepDef } from './step-def.interface';

export class StepGroupValidation extends RecursiveValidation<StepGroupDef> {
  childSteps?: { [pk: number]: RecursiveValidation<StepDef> };
  childGroups?: { [pk: number]: RecursiveValidation<StepGroupDef> };

  updateChildErrorCount(): number {
    const childStepErrCount = _.chain(this.childSteps)
      .map(step => step.updateSelfAndChildErrorCount())
      .sum()
      .value();
    const childGroupErrCount = _.chain(this.childGroups)
      .map(step => step.updateSelfAndChildErrorCount())
      .sum()
      .value();
    this.childErrorCount = childStepErrCount + childGroupErrCount;
    return this.childErrorCount;
  }
}
