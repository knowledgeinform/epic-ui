import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

interface ErrorData {
  description: string;
  errorMessage: string;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent {
  description: string;
  errorMessage: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorData) {
    this.description = data.description;
    this.errorMessage = data.errorMessage;
  }



}
