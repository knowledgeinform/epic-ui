import { RecursiveValidation, ErrorSet } from './recursive-validation';
import * as _ from 'lodash';
import { StepDef } from './step-def.interface';
import {StepTableCell} from "@app/interfaces/step-table-cell";

export class StepValidation extends RecursiveValidation<StepDef> {
  errors: ErrorSet[] = [];
  children?: { [id: number]: RecursiveValidation<StepTableCell> };

  updateChildErrorCount(): number {
    this.childErrorCount = _.chain(this.children)
      .map(step => step.updateSelfAndChildErrorCount())
      .sum()
      .value();
    return this.childErrorCount;
  }

}
