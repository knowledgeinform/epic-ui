import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'disabledApproverIsApprovedColor'
})
export class DisabledApproverIsApprovedColorPipe implements PipeTransform {

  transform(isApproved: boolean | null, args?: any): string {
    switch (isApproved) {
      case null: {
        return '#e0e0e0';
      }
      case true: {
        return '#9bcc9b';
      }
      case false: {
        return '#c79797';
      }
      default: {
        return '#000';
      }
    }
  }
}
