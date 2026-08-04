import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PinChangeComponent} from '@app/components/user-profile/pin-change/pin-change.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import { Users } from '@app/interfaces/users';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-pin-dialog',
  templateUrl: './new-pin-dialog.component.html',
  styleUrls: ['./new-pin-dialog.component.css']
})
export class NewPinDialogComponent implements OnInit {

  user: Users;
  fetchIsDone: boolean = true;
  constructor(public dialogRef: MatDialogRef<PinChangeComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              private epicService: EPICWSService,
              public dialog: MatDialog,
              private loggerService: LoggerService) {
    this.user = data.user;
    this.dialogRef.disableClose = true;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    // make call to backend to get randomly generated pin.
    this.fetchIsDone = false;
    this.loggerService.info('Generating random pin for user ' + this.user.username);
    this.epicService.generatePinForUser(this.user).subscribe((data) => {
      if (data.error) {
        this.loggerService.error('Could not generate random pin for ' + this.user.username);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Problem generating new random pin for user: ' + this.user.username,
            errorMessage: data.error
          }
        });
      } else {
        this.user = data;
        this.fetchIsDone = true;
      }
    });
  }
}
