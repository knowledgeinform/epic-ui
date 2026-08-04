import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lockButtonText'
})
export class LockButtonTextPipe implements PipeTransform {

  transform(isLockedFromEditing: boolean, ...args: unknown[]): string {
    return isLockedFromEditing ? 'Locked from editing. Click to unlock!' : 'Unlocked for editing. Click to lock!';
  }

}
