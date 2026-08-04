import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ConfirmationDialogModel {
  constructor(public title: string, public message: string) {
  }
}


@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})

export class ConfirmationDialogComponent {

  title: string;
  message: string;

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogModel) {
    this.title = data.title;
    this.message = data.message;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }



  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
