import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';

/**
 * Renders a Moment value as a UTC calendar date string.
 *
 * Equipment calibration dates are stored as UTC-midnight instants. Using Angular's
 * built-in date pipe with the viewer's local timezone shifts the displayed day for
 * anyone west of UTC. This pipe explicitly formats in UTC, so the calendar day shown
 * matches the value stored in the database regardless of the viewer's location.
 */
@Pipe({
  name: 'utcDate',
})
export class UtcDatePipe implements PipeTransform {

  transform(value: Moment | null | undefined, format: string = 'MMMM D, YYYY'): string | null {
    if (!value) return null;
    return value.clone().utc().format(format);
  }
}
