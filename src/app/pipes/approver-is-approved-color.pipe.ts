import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'approverIsApprovedColor'
})
export class ApproverIsApprovedColorPipe implements PipeTransform {

  transform(isApproved: boolean | null, args?: any): string {
    switch (isApproved) {
      case null: {
        return '#b2b2b2';
      }
      case true: {
        return '#00d000';
      }
      case false: {
        return '#d00000';
      }
      default: {
        return '#000';
      }
    }
  }

}
