import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';

@Pipe({
  name: 'isAfterToday'
})
export class IsAfterTodayPipe implements PipeTransform {

  private readonly endOfToday = moment().utc();

  transform(date: Moment, args?: any): any {
    if (!date) return;
    return date.isAfter(this.endOfToday, 'day');
  }

}
