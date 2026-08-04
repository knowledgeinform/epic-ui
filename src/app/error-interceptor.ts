import {Injectable} from '@angular/core';
import {LoginService} from './services/login.service';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor {
  constructor(private jwtService: LoginService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        // auto logout if 401 returned
        this.jwtService.logout();
        location.reload();
      }

      // const error = err.error.message || err.statusText;
      return throwError(err);
    }));
  }
}
