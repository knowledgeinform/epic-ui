import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {UntypedFormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-createprocedure-dialog',
  templateUrl: './createprocedure-dialog.component.html',
  styleUrls: ['./createprocedure-dialog.component.css']
})
export class CreateprocedureDialogComponent {
  error;
  newProcedureDefForm; // global variable that will hold the procedureDef from procedureDefinition widget
  constructor(
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateprocedureDialogComponent>,
    public epicService: EPICWSService,
    private loggerService: LoggerService) {
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }



  // receives the form from the procedureDefinition widget and assigns it to newProcedureDefForm
  receiveProcedureDef(event) {
    if (event !== undefined) {
      this.newProcedureDefForm = this.formBuilder.group(event.value);
    } else {
      this.newProcedureDefForm = event;
    }
  }

  // submits the new procedureDef
  submitNewProcedureDef() {
    // checks that all fields are valid
    if (this.newProcedureDefForm.valid) {
      // calls service to create the new procedure;
      this.epicService.createNewProcedure(this.newProcedureDefForm.value).subscribe((data) => {
        if (data) {
          this.loggerService.info('Successfully created a new procedureDef, navigating to revision 1 with id ' + data.procedureDetails[0].id);
          this.router.navigate(['procedure', data.procedureDetails[0].id]);
          this.close();
        } else {
          this.loggerService.error('Could not create new procedureDef with given value', this.newProcedureDefForm.value);
        }
      });
    }
  }
}
