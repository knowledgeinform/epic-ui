import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

/**
 * Verifies a user is an admin. Should be used in conjunction with standard `AuthGuard`. User is redirected to default route if not an admin.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuardAdmin  {

  constructor(
    private router: Router,
    private loginService: LoginService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const authorized = this.loginService.currentUser.admin;
    if (!authorized) this.router.navigate(['']);
    return authorized;
  }

}
