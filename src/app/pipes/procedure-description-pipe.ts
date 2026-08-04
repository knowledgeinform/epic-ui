import { Pipe, PipeTransform } from '@angular/core';
import {ProcedureDef} from "@app/interfaces/procedure-def.dto";

@Pipe({
  name: 'procedureDescriptionPipe'
})
export class ProcedureDescriptionPipe implements PipeTransform {

  transform(procedureDef: ProcedureDef): any {
    let maxLength = 50;
    let displayDescription = procedureDef.description;
    if (procedureDef.description != null && procedureDef.description.length > maxLength) {
      displayDescription = displayDescription.substr(0, maxLength).trim();
      displayDescription += "...";
    }
      return displayDescription;
  }

}
