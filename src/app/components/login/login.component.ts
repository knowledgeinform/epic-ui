import {Component, OnInit} from '@angular/core';
import {LoginService} from '@app/services/login.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { OfflineService } from '@app/services/offline.service';
import { UserAuthDTO } from '@app/interfaces/user-auth.dto';
import { Utils } from '@app/utils';
import { MatDialog } from '@angular/material/dialog';
import { Users } from '@app/interfaces/users';
import { NewPinDialogComponent } from '../user-profile/new-pin-dialog/new-pin-dialog.component';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public offlineService: OfflineService,
    private loggerService: LoggerService
    ) {
  }

  loginForm: UntypedFormGroup;
  loading = false;
  returnUrl: string;
  errorMessage: string;

  ngOnInit() {
    // reset login status
    this.loginService.logout();

    // get return URL from login parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // init login form
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Disable password field while offline.
    this.offlineService.offlineSubject.subscribe( offline => {
      const pwField = this.loginForm.get('password');
      pwField.setValidators( offline ? null : Validators.required);
      pwField.updateValueAndValidity();
    });

  }

  public login() {
    this.loading = true;
    if (this.loginForm.invalid) {
      return;
    }
    const promise = this.offlineService.offline ? this.loginService.loginOffline(this.loginForm.value.username as string) : this.loginService.loginOnline(this.loginForm.value);
    promise.then( (user) => {
      this.evaluateForNewUser(user);
      this.loading = false;
      const returnUrl = this.returnUrl || 'dashboard';
      this.loggerService.createAndConfigureLogger(user);
      this.loggerService.info('Login successful; navigating to ' + returnUrl);
      this.router.navigate([returnUrl]);
    }, (reason) => {
      this.errorMessage = reason;
      console.log('Could not log in.' + reason);
    });
  }

  private evaluateForNewUser(data: UserAuthDTO): void {
    const pinResetRequired = data['pin'] !== null && data['pin'] !== undefined && data['pin'] === Utils.getSystemPin();
    if (pinResetRequired) {
      // if here, this is a user that needs to set their pin.
      const user = {} as Users;
      user.username = data['userName'];
      user.displayName = data['displayName'];
      user.pin = data['pin'];
      this.dialog.open(NewPinDialogComponent, {
        width: '550px',
        minHeight: '200px',
        disableClose: true,
        data: {
          user: user
        }
      });
    }
  }

}
