import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {UntypedFormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {MessageService} from '@app/services/message.service';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import * as _ from "lodash";

@Component({
  selector: 'app-run-start-dialog',
  templateUrl: './run-start-dialog.component.html',
  styleUrls: ['./run-start-dialog.component.css']
})
export class RunStartDialogComponent implements OnInit {
  error: any;
  searchForProcedure: boolean;
  selectedProcedureDetails : ProcedureDetails;
  newRunForm: any;
  searchStatusType: string;
  runNumber;
  saving = false;
  constructor(public dialogRef: MatDialogRef<RunStartDialogComponent>,
              public epicService: EPICWSService,
              private formBuilder: UntypedFormBuilder,
              private router: Router,
              public messageService: MessageService,
              @Inject(MAT_DIALOG_DATA) data,
              private loggerService: LoggerService) {
    this.searchForProcedure = data.searchForProcedure;
    if (!_.isNil(data.selectedProcedureDetailsPk)) {
      // retrieve the selected procedure def's info from the backend
      this.loggerService.info('Retrieving the selected procedure; pk=' + data.selectedProcedureDetailsPk);
      this.epicService.getProcedureDetailsByPk(data.selectedProcedureDetailsPk).subscribe((d) => {
        if (d !== null && d !== undefined) {
          this.selectedProcedureDetails = d;
        } else {
          this.loggerService.error('Could not retrieve the selected procedure with pk ' + data.selectedProcedureDetailsPk);
          this.messageService.showSnackBar('Error retrieving the selected procedure; please retry search', 'CLOSE');
          this.searchForProcedure = true;
        }
      });
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    // this.searchForProcedure = true;
    this.searchStatusType = 'READY';
  }

  receiveProcedureSearchSelection(event): void {
    if (event === null) {
      return;
    }
    this.selectedProcedureDetails = event;
    // load run definition
    this.loadRunDefinition();
  }

  loadRunDefinition(): void {
    this.searchForProcedure = false;
  }

  receiveRunDef(event): void {
    if (event.error) {
      this.loggerService.warn('There is no released revision for the selected procedure; returning to procedure search');
      this.messageService.showSnackBar(event.error, 'Ready Version Not Found');
      this.goBackToProcedureSearch();
    } else {
      if (event.runInfo === undefined) {
        this.newRunForm = undefined;
        return;
      }
      this.newRunForm = this.formBuilder.group(event.runInfo.value);
      this.selectedProcedureDetails = event.procedureDetails;
      this.runNumber = event.runNumber;
    }
  }

  goBackToProcedureSearch(): void {
    this.searchForProcedure = true;
    this.selectedProcedureDetails = undefined;
  }

  submitRunStart(): void {
    if (this.newRunForm.valid && this.selectedProcedureDetails !== null && this.selectedProcedureDetails !== undefined) {
      // create a run data object
      const run = this.newRunForm.value;
      const phase = run.testingPhase;
      delete run['testingPhase'];
      run['testingPhase'] = {'pk': phase};

      this.selectedProcedureDetails.run = run;

      this.saving = true;
      this.loggerService.info('Creating a new run for procedure revision with pk ' + this.selectedProcedureDetails.pk);
      this.epicService.createNewRun(this.selectedProcedureDetails.pk, this.runNumber, run).subscribe((data) => {
        this.saving = false;
        if (data !== null && data !== undefined) {
          this.router.navigate(['run', data.id, 0]);
        } else {
          this.loggerService.error('Could not create run for procedure revision with pk ' + this.selectedProcedureDetails.pk);
          this.messageService.showSnackBar('Could not create run for the selected procedure revision. Email EPIC Support via the main menu.', 'CLOSE', 5000);
          this.newRunForm = undefined;
        }
        this.dialogRef.close();
      });
    }
  }
}
