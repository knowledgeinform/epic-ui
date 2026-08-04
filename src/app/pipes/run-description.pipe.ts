import { Pipe, PipeTransform } from '@angular/core';
import { Run } from '@app/interfaces/Run';


@Pipe({
  name: 'RunDescriptionPipe'
})
export class RunDescriptionPipe implements PipeTransform {

  transform(run: Run): any {
    let maxLength = 50;
    let displayDescription = run.description;
    if (run.description != null && run.description.length > maxLength) {
      displayDescription = displayDescription.substr(0, maxLength).trim();
      displayDescription += "...";
    }
    return displayDescription;
  }

}
