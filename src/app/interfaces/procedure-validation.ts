import { RecursiveValidation } from './recursive-validation';
import { StepGroupDef } from './step-group-def';
import * as _ from 'lodash';
import { ProcedureDetails } from './procedure-details';

export class ProcedureValidation extends RecursiveValidation<ProcedureDetails>{
  children?: { [pk: number]: RecursiveValidation<StepGroupDef> };

  public updateChildErrorCount(): number {
    this.childErrorCount = _.chain(this.children)
      .map(child => child.updateSelfAndChildErrorCount())
      .sum()
      .value();
    return this.childErrorCount;
  }

}
