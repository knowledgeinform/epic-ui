import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'findInCollection'
})
export class FindInCollectionPipe implements PipeTransform {

  transform(collection: _.Collection<any>, propName: string, propVal: any): any {
    return _.find(collection, (elm) => _.get(elm, propName) == propVal);
  }

}
