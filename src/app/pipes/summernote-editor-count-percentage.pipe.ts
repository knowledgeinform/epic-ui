import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from "@app/utils";

@Pipe({
  name: 'summernoteEditorCountPercentage'
})
export class SummernoteEditorCountPercentagePipe implements PipeTransform {

  transform(value: string): number {
    if (value) {
      let maxLength = Utils.getMaxRichTextEditorLength();
      return Math.floor(value.length / maxLength * 100);
    } else {
      return 0;
    }
  }

}
