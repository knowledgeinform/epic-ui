import { Pipe, PipeTransform } from '@angular/core';
import { NonConformance } from '@app/interfaces/non-conformance';
import * as _ from 'lodash';

@Pipe({
  name: 'nonconformanceCount'
})
export class NonconformanceCountPipe implements PipeTransform {

  transform(ncs: NonConformance[]): number {
    return _.chain(ncs)
      .map(nc => nc.nonconformanceComments)
      .flatten()
      .value()
      .length;
  }

}
