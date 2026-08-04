import { Pipe, PipeTransform } from '@angular/core';
import {LoginService} from '@app/services/login.service';

@Pipe({
  name: 'canTransitionProcedureOrRun'
})
export class CanTransitionProcedureOrRunPipe implements PipeTransform {

  transform(userName: string, loginService: LoginService): boolean {
    const currentlyLoggedInUserName = loginService.currentUserName;
    const currentLoggedInUserIsAdmin = loginService.getCurrentUser().isAdmin;

    if (userName === currentlyLoggedInUserName || currentLoggedInUserIsAdmin) return true;
    return false;
  }
}
