import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private router: Router, private jwtService: LoginService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (!navigator.onLine || this.jwtService.isLoggedIn.getValue()) {
      return true;
    }

    this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return false;

  }
}
