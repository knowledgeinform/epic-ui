import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Displays a snackbar in the UI.
   *
   * @param msg The text message to display in the snackbar.
   * @param action The text to display in the snackbar's action button.
   * @param duration The amount of time in MS to show the snackbar for.
   */
  showSnackBar(msg: string, action: string, duration: number = 2000): void {
    this.snackBar.open(msg, action, {
      duration: duration,
    });
  }
}
