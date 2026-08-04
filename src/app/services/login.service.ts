import {Injectable} from '@angular/core';
import {LoginCredentials} from '../login-credentials.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserAuthDTO} from '../interfaces/user-auth.dto';
import * as _ from 'lodash';
import {LocalStorageService} from '@app/services/local-storage.service';
import {AppConfigService} from '@app/services/app-config-service.service';
import { Users } from '@app/interfaces/users';
import {LoggerService} from '@app/services/logger.service';

const USER_CACHE_KEY = 'CURRENT_USER';  // Used to access the User object saved in this.localStorage.

const httpJsonOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})


export class LoginService {

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService,
    private configService: AppConfigService
  ) {
  }

  public get currentUser(): UserAuthDTO {
    return this.localStorage.get(USER_CACHE_KEY) as UserAuthDTO;
  }

  public getCurrentUser(): Users {
    const ua = this.currentUser;

    const user = new Users();
    user.displayName = ua.displayName;
    user.isAdmin = ua.admin;
    user.pin = ua.pin;
    user.username = ua.userName;

    return user;
  }

  private setCurrentUser(user: UserAuthDTO) {
    this.localStorage.set(USER_CACHE_KEY, user);
  }

  public get currentUserName() {
    return _.get(this.currentUser, 'userName', null);
  }

  public isLoggedIn = new BehaviorSubject<boolean>(this.currentLoginStatus());

  private currentLoginStatus() {
    return this.currentUser !== null;
  }

  private login(userInfo: LoginCredentials): Observable<UserAuthDTO> {
    // reload the app config file to trigger caching
    this.configService.loadConfig();

    return this.http.post<UserAuthDTO>(`${this.configService.config.apiUrl}/authentication`, userInfo, httpJsonOptions).pipe(
      map(user => {
        if (user && user.accessToken) {
          this.setCurrentUser(user);
          this.isLoggedIn.next(true);
        }
        return user;
      }));

  }

  public logout() {
    this.localStorage.remove(USER_CACHE_KEY);
    this.isLoggedIn.next(false);
  }


  public loginOffline(username: string): Promise<UserAuthDTO> {
    const cachedUser = _.find(this.getOfflineUsers(), u => u.userName === username);
    if (cachedUser) {
      this.setCurrentUser(cachedUser);
      return Promise.resolve(cachedUser);
    }
    return Promise.reject('The username supplied has not been used to log in to this device before.');
  }

  public loginOnline(credentials: LoginCredentials): Promise<UserAuthDTO> {
    return this.login(credentials).toPromise().then(
      user => {

        this.addUserToOfflineList(user);

        // Return login success.
        return Promise.resolve(user);

      }, error => {
        // login failed

        // Report error.
        let errorMessage = 'Error occurred during login.';
        if (error.status === 403) {
          errorMessage = 'Username or Password is incorrect. Please check credentials.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Return login failure.
        return Promise.reject(errorMessage);

      }
    );
  }

  private getOfflineUsers(): UserAuthDTO[] {
    return this.localStorage.get('users') as UserAuthDTO[] || [];
  }

  private addUserToOfflineList(user: UserAuthDTO): void {
    const usersKey = 'users';
    const users = _.unionBy(this.getOfflineUsers(), [user], u => u.userName);
    this.localStorage.set(usersKey, users);
  }

  // TODO: REGISTER a new USER?
  // register(email:string, password:string) {
  //   return this.httpClient.post<{access_token: string}>('http://www.your-server.com/auth/register', {email, password}).pipe(tap(res => {
  //     this.login(email, password)
  //   }))
  // }

}
