import { Pipe, PipeTransform } from '@angular/core';
import {StepDefDTO} from "@app/interfaces/step-def.dto.interface";
import {StepDef} from "@app/interfaces/step-def.interface";
import {StepGroupDef} from "@app/interfaces/step-group-def";
import {ProcedureInstruction} from "@app/interfaces/procedure-instruction";
import {LineList} from "@app/services/line-edit-reporting.service";
import {RedLineComment} from "@app/interfaces/comment.dto";
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {BulkLineValidationType} from "@app/interfaces/bulk-line-validation-type";

@Pipe({
  name: 'bulkSignType'
})
export class BulkSignTypePipe implements PipeTransform {

  transform(type: BulkLineValidationType,  args?: any): any {
    return type + " Lines";
  }
}
