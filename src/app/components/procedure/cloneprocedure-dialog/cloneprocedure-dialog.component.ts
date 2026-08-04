import {Component, HostListener, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {UntypedFormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureDetails} from "@app/interfaces/procedure-details";

@Component({
  selector: 'app-cloneprocedure-dialog',
  templateUrl: './cloneprocedure-dialog.component.html',
  styleUrls: ['./cloneprocedure-dialog.component.css']
})
export class CloneprocedureDialogComponent implements OnInit {
  error;
  selectedProcedureDet: ProcedureDetails; // global variable for holding the selected procedureDet from the search
  searchForProcedure = true; // global variable for controlling which widget to display, the search or the procedure definition
  newProcedureDefForm; // global variable for holding the newly defined procedureDef fields from the procedure definition widget
  searchStatusType: string;
  isGlobalSearch: boolean;
  constructor(
    public dialogRef: MatDialogRef<CloneprocedureDialogComponent>,
    public epicService: EPICWSService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private loggerService: LoggerService
  ) { }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.searchStatusType = 'ALL';
    this.isGlobalSearch = false;
  }

  // this function receives the selected procedureDef from the search widget and sets selectedProcedureDef
  private receiveProcedureSearchSelection(event) {
    this.selectedProcedureDet = event;
    // load procedure definition
    this.loadProcedureDefinition();
  }

  // loads the procedure defintion widget, hiding the search widget at the same time
  private loadProcedureDefinition() {
    this.searchForProcedure = false;
  }

  // the user may be on procedure definition and wish to go back to the search; this function
  // hides the procedure defintion widget and displays the search, and deletes the current values of
  // selectedVersion and selectedProcedureDef
  private goBacktoProcedureSearch() {
    this.searchForProcedure = true;
    this.selectedProcedureDet = undefined;
  }

  // receives the values for procedureDef from the procedure definition widget
  private receiveProcedureDef(event) {
    this.newProcedureDefForm = this.formBuilder.group(event.value);
  }

  // creates an object from the new procedure def and the selected version and calls
  // the service to create a new procedure with this information on the backend. Closes the dialog after
  private submitClonedProcedureDef() {
    // checks that there's a selected procedure detail and that the form is valid
    if (this.newProcedureDefForm.valid && this.selectedProcedureDet !== null) {
      // calls service to clone the procedure
      const procedureData = {procedureDef: this.newProcedureDefForm.value, procedureDetailsPk: this.selectedProcedureDet.pk};
      this.loggerService.info('Cloning a new procedure from existing revision with id ' + this.selectedProcedureDet.id);
      this.epicService.cloneProcedure(procedureData).subscribe((data) => {
        // catch any errors
        if (data.error) {
          this.loggerService.error('Cloning a new procedure failed: ' + data.error);
          this.error = data.error;
        } else {
          // routes to procedure to display the new procedure and closes the dialog
          this.router.navigate(['procedure', data.procedureDetails[0].id]);
          this.onCancel();
        }
      });
    }
  }

  // closes the dialog
  private onCancel(): void {
    this.dialogRef.close();
  }
}
