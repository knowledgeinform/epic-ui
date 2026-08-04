import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

/**
 * Returns `true` if the supplied Moment representsa  time before the end of the current day.
 * Note: This may need to become an impure pipe because of how Angular handles change detection for date inputs. However, this seems to work with our current equipment table implementation, perhaps because of our server call and subsequent client value reload.
 */
@Pipe({
  name: 'isBeforeToday',
})
export class IsBeforeTodayPipe implements PipeTransform {

  private readonly endOfToday = moment().utc();

  transform(date: Moment, args?: any): boolean {
    if (!date) return;
    return date.isBefore(this.endOfToday, 'day');
  }

}
