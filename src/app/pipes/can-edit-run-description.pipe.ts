import { Pipe, PipeTransform } from '@angular/core';
import { Run } from '@app/interfaces/Run';
import { UserAuthDTO } from '@app/interfaces/user-auth.dto';
import { canEditRunField } from '@app/pipes/can-edit-run-field';

/**
 * Pipe to determine if a user can edit a run's description.
 * Delegates to the shared {@link canEditRunField} utility.
 */
@Pipe({
  name: 'canEditRunDescription',
  pure: true
})
export class CanEditRunDescriptionPipe implements PipeTransform {

  transform(run: Run, user: UserAuthDTO, readOnly: boolean, offline: boolean): boolean {
    return canEditRunField(run, user, readOnly, offline);
  }

}
