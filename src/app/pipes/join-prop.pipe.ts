import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'joinProp'
})
export class JoinPropPipe implements PipeTransform {

  transform(list: any[], propName: string, joinBy: string, finalJoinBy?: string): string {
    const vals = _.map(list, propName);
    finalJoinBy = finalJoinBy || joinBy;
    if (list.length == 1)
      return vals[0];
    else
      return vals.slice(0, -1).join(joinBy) + finalJoinBy + vals.slice(-1);
  }

}
