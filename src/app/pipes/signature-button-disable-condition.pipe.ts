import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({
  name: 'signatureButtonDisableCondition'
})
export class SignatureButtonDisableConditionPipe implements PipeTransform {

  transform(signCommentComponentFormControlValue: any, args?: any): any {
    return _.isNil(signCommentComponentFormControlValue) ||
          signCommentComponentFormControlValue.length == 0; 
  }
}
