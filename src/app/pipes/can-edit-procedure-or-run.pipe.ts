import {Pipe, PipeTransform} from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {EditType} from "@app/interfaces/edit-type.dto";
import {ProcedureStatus} from "@app/interfaces/procedure-status.dto";

@Pipe({
  name: 'canEditProcedureOrRun'
})
export class CanEditProcedureOrRunPipe implements PipeTransform {

  /* This pipe determines if a given procedureDetails object (which represents a run or a procedure) can be edited.
  * Procedures can be edited when in DRAFT status.
  * Runs can be edited when redlining is enabled.
  * This pipe does NOT control if the run/procedure is unlocked for editing.
  */
  transform(procedureData: ProcedureDetails, redliningEnabled: boolean): boolean {
    // check for procedure or run
    if (procedureData.editType === EditType.ORIGINAL) {
      // this is a procedure. Return its draft status.
      return ProcedureStatus[procedureData.status] === ProcedureStatus.DRAFT;
    } else {
      // this is a run. Return the redliningEnabled value.
      return procedureData.redliningEnabled;
    }
  }

}
