import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {Users} from '@app/interfaces/users';
import {MatDialog} from '@angular/material/dialog';
import {MatInput} from '@angular/material/input'
import {Utils} from '@app/utils';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-pin-change',
  templateUrl: './pin-change.component.html',
  styleUrls: ['./pin-change.component.css']
})
export class PinChangeComponent implements OnInit {

  @Input() user: Users;
  @Input() showCancelButton: boolean = true;
  @ViewChild('newPin', /* TODO: add static flag */ {}) newPinInput: MatInput;
  @ViewChild('confirmNewPin', /* TODO: add static flag */ {}) confirmNewPinInput: MatInput;
  @ViewChild('currentPin', {static: true}) currentPinInput: MatInput;
  @Output() cancelPin = new EventEmitter<any>();
  @Output() userInfoChange = new EventEmitter<any>();
  oldPinForm = this.formBuilder.group({
    currentPin: ['', Validators.compose([Validators.required,
      Validators.pattern('[0-9][0-9][0-9][0-9][0-9][0-9]'),
      Validators.minLength(6),
      Validators.maxLength(6)])]
  });
  newPinForm = this.formBuilder.group({
    newPin: ['', Validators.compose([Validators.required,
      Validators.pattern('[0-9][0-9][0-9][0-9][0-9][0-9]'),
      Validators.minLength(6),
      Validators.maxLength(6)])],
    confirmNewPin: ['', Validators.compose([Validators.required,
      Validators.pattern('[0-9][0-9][0-9][0-9][0-9][0-9]'),
      Validators.minLength(6),
      Validators.maxLength(6)])],
  });
  oldPinCorrect: boolean;
  oldPinErrorMessage: string = '';
  newPinOK: boolean;
  newPinErrorMessage: string = '';
  confirmNewPinOK: boolean;
  confirmNewPinErrorMessage: string = '';
  constructor(
    private epicService: EPICWSService,
    private messageService: MessageService,
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.newPinForm.get('newPin').disable();
    this.newPinForm.get('confirmNewPin').disable();
    this.currentPinInput.focus();
  }

  checkOldPin(): void {
    if (this.oldPinForm.valid) {
      if (this.oldPinForm.get('currentPin').value + '' === this.user.pin) {
        this.oldPinCorrect = true;
        this.oldPinErrorMessage = '';
        this.newPinForm.get('newPin').enable();
        this.newPinInput.focus();
      } else {
        this.newPinForm.reset();
        this.newPinForm.get('newPin').disable();
        this.newPinForm.get('confirmNewPin').disable();
        this.oldPinCorrect = false;
        this.oldPinErrorMessage = 'Invalid entry - this entry is not your current pin.';
      }
    } else {
      this.oldPinCorrect = false;
      const currentEntry = this.oldPinForm.get('currentPin').value;
      if (isNaN(currentEntry)) {
        this.oldPinErrorMessage = 'Contains non-numbers - use numbers only.';
      } else if (currentEntry.length < 6) {
        this.oldPinErrorMessage = 'Not enough digits - pins are six digits.';
      }
    }
  }

  checkNewPin(): void {
    if (this.newPinForm.get('newPin').valid) {
      if (this.newPinForm.get('newPin').value === Utils.getSystemPin()) {
        this.newPinErrorMessage = 'System reserved code - enter a different pin.';
        this.newPinForm.get('newPin').reset();
        this.newPinForm.get('confirmNewPin').disable();
        this.newPinForm.get('confirmNewPin').reset();
      } else {
        if (this.newPinForm.get('newPin').value !== this.oldPinForm.get('currentPin').value) {
          this.newPinOK = true;
          this.newPinErrorMessage = '';
          this.newPinForm.get('confirmNewPin').enable();
          this.confirmNewPinInput.focus();
        } else {
          this.newPinOK = false;
          this.newPinErrorMessage = 'New pin cannot be the same as your current pin. Enter a new pin.';
          this.newPinForm.get('newPin').reset();
          this.newPinForm.get('confirmNewPin').disable();
          this.newPinForm.get('confirmNewPin').reset();
        }
      }
    } else {
      this.newPinForm.get('confirmNewPin').reset();
      this.newPinForm.get('confirmNewPin').disable();
      this.newPinOK = false;
      const currentEntry = this.newPinForm.get('newPin').value;
      if (isNaN(currentEntry)) {
        this.newPinErrorMessage = 'Contains non-numbers - use numbers only.';
      } else if (currentEntry.length < 6) {
        this.newPinErrorMessage = 'Not enough digits - pins are six digits.';
      }
    }
  }

  checkConfirmNewPin(): void {
    if (this.newPinForm.get('confirmNewPin').valid) {
      if (this.newPinForm.get('newPin').value === this.newPinForm.get('confirmNewPin').value) {
        this.confirmNewPinOK = true;
        this.confirmNewPinErrorMessage = '';
      } else {
        // if here, pins don't match
        this.confirmNewPinOK = false;
        this.confirmNewPinErrorMessage = 'Does not match new pin - re-enter new pin.';
        this.newPinForm.get('confirmNewPin').reset();
      }
    } else {
      this.confirmNewPinOK = false;
      const currentEntry = this.newPinForm.get('confirmNewPin').value;
      if (isNaN(currentEntry)) {
        this.confirmNewPinErrorMessage = 'Contains non-numbers - use numbers only.';
      } else if (currentEntry.length < 6) {
        this.confirmNewPinErrorMessage = 'Not enough digits - pins are six digits.';
      }
    }
  }

  clearInputs() {
    this.oldPinForm.reset();
    this.newPinForm.reset();
  }

  cancelPinChange(): void {
    this.cancelPin.emit(false);
  }

  submitPinChange(): void {
    this.user.pin = this.newPinForm.get('confirmNewPin').value;
    // all other information about the user should remain the same
    this.loggerService.info('Saving new pin for user ' + this.user.username);
    this.epicService.updateUserInformation(this.user).subscribe((data) => {
      if (data.error) {
        this.loggerService.error('Error while saving new pin for user ' + this.user.username + ': ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving pin change',
            errorMessage: data.error
          }
        });
      } else {
        this.user = data;
        this.userInfoChange.emit(this.user);
        this.cancelPin.emit(false);
        this.messageService.showSnackBar('Pin Changed', 'CLOSE');
        this.clearInputs();
      }
    });
  }
}
