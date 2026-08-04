import {Component, OnInit} from '@angular/core';
import {AppComponent} from '@app/components/app/app.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {LoginService} from '@app/services/login.service';
import {Users} from '@app/interfaces/users';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  fetchIsDone: boolean = false;
  user: Users;
  pinDisplayType: string = 'password';
  displayPin: boolean = false;
  pinChangeDisplay: boolean = false;
  disablePinChangeButton: boolean = false;

  constructor(
    public app: AppComponent,
    public epicService: EPICWSService,
    public jwtService: LoginService,
    public dialog: MatDialog,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.loggerService.info('Retrieving user data for profile page');
    this.epicService.getUserByUserName(this.jwtService.currentUserName).subscribe((data) => {
      if (data.error) {
        this.loggerService.error('Could not retrieve user data for profile page of ' + this.jwtService.currentUserName);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error getting user info',
            errorMessage: data.error
          }
        });
      } else {
        this.user = data;
      }
      this.fetchIsDone = true;
    });
  }

  togglePinDisplay() {
    this.displayPin = !this.displayPin;
    if (this.displayPin) {
      this.pinDisplayType = 'text';
    } else {
      this.pinDisplayType = 'password';
    }
  }

  displayPinChange(): void {
    this.pinChangeDisplay = true;
    this.disablePinChangeButton = true;
  }

  hidePinChange(): void {
    this.pinChangeDisplay = false;
    this.disablePinChangeButton = false;
    this.pinDisplayType = 'password';
    this.displayPin = false;
  }

  updateUserInfo(userData: Users): void {
    this.user = userData;
  }
}
