import {Injectable} from '@angular/core';
import {ProcedureValidation} from '../interfaces/procedure-validation';
import {StepGroupValidation} from '../interfaces/step-group-validation';
import {StepGroupDef} from '../interfaces/step-group-def';
import {StepValidation} from '../interfaces/step-validation';
import {ValidationErrors} from '../interfaces/validation-errors';
import {StepType} from '../interfaces/step-type.dto';
import {RecursiveValidation} from '../interfaces/recursive-validation';
import * as _ from 'lodash';
import {EditType} from '../interfaces/edit-type.dto';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {StepTableCell} from "@app/interfaces/step-table-cell";

@Injectable({
  providedIn: 'root'
})
export class RunValidationService {

  public procedureValidation: {
    [procedureId: string]: ProcedureValidation,
  } = {};

  constructor() { }

  /**
   * Validates the procedure and adds it to the procedure validation cache.
   */
  public validateProcedure(procedure: ProcedureDetails): ProcedureValidation {

    // Won't work because we're generating new values. Perhaps we need an event emitter to trigger the group on validation updates?
    const validation: ProcedureValidation = new ProcedureValidation(procedure);
    validation.children = _.chain(procedure.stepGroupDefs)
      .map(group => this.validateStepGroup(procedure.pk, group))
      .compact()
      .keyBy(group => group.element.pk)
      .orderBy(group => group.element.displayOrder)
      .value();

    const returnVal = validation.errors || !_.isEmpty(validation.children) ? validation : null;

    this.procedureValidation[procedure.pk] = returnVal;

    if (returnVal) returnVal.updateSelfAndChildErrorCount();
    return returnVal;
  }

  public validateStepGroup(procedurePk: number, stepGroup: StepGroupDef): StepGroupValidation {
    const validation = new StepGroupValidation(stepGroup);

    if (stepGroup.editType === EditType.REDLINE_DELETE) {
      return null;
    }

    if (!_.isEmpty(stepGroup.stepDefs)) {
      validation.childSteps = _.compact(stepGroup.stepDefs.map(child => this.validateStep(procedurePk, child)));
    }
    if (!_.isEmpty(stepGroup.stepGroupDefsChildren)) {
      validation.childGroups = _.compact(stepGroup.stepGroupDefsChildren.map(child => this.validateStepGroup(procedurePk, child)));
    }
    return validation.errors || !_.isEmpty(validation.childSteps) || !_.isEmpty(validation.childGroups) ? validation : null;
  }

  public validateStep(procedurePk: number, step: StepDef): StepValidation | null {

    const validation = new StepValidation(step);

    // Valid if manually marked or a REDLINE_DELETE.
    if (step.isManualValidation || step.editType === EditType.REDLINE_DELETE)
      return null;

    // Check for errors:
    if (step.requireWitness && !step.witnessSecondSignature)
      validation.errors.push({
        error: ValidationErrors.STEP_WITNESS_SIGNATURE_REQUIRED,
        description: 'A witness\' 521 and pin is required.',
      });
    if (step.mandatoryInspection && !step.mandatoryInspectionSecondSignature)
      validation.errors.push({
        error: ValidationErrors.STEP_INSPECTION_SIGNATURE_REQUIRED,
        description: 'An inspector\'s 521 and pin is required.',
      });
    switch (step.type) {

      case StepType.CHECKBOX:
        if (!step.runValue) validation.errors.push({
          error: ValidationErrors.FIELD_REQUIRED,
          description: 'The checkbox must be checked.',
        });
        break;

      case StepType.SINGLE_VALUE:
        if (_.isEmpty(step.runValue)) validation.errors.push({
          error: ValidationErrors.FIELD_REQUIRED,
          description: 'The value cannot be empty.',
        });
        break;

      case StepType.TABLE:
        // Add children & validate them.
        validation.children = _.chain(step.stepTableRows)
          .map(row => row.stepTableCells.map(cell => this.validateStepTableCell(procedurePk, cell)))
          .flatten()
          .compact()
          .keyBy(cell => cell.element.pk)
          .value();
        break;

      default:
        break;
    }

    return validation.errors.length || !_.isEmpty(validation.children) ? validation : null;
  }

  private validateStepTableCell(procedurePk: number, cell: StepTableCell): RecursiveValidation<StepTableCell> {
    const validation = new RecursiveValidation<StepTableCell>(cell);
    validation.errors = [];
    
    if ((cell.editable && !cell.optional) && 
        (!cell.nonEditableValue || _.isEmpty(cell.nonEditableValue.toString().replace( /(<([^>]+)>)/ig, '').trim()))) 
        validation.errors.push({
          error: ValidationErrors.FIELD_REQUIRED,
          description: 'All required editable table cells must be filled-in.'
        });

    return validation.errors.length ? validation : null;
  }

}
