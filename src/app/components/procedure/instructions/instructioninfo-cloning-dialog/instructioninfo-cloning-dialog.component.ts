import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessageService} from '@app/services/message.service';
import {ErrMsg} from '@app/services/epic-ws.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {InstructionService} from '@app/services/instruction.service';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';

@Component({
  selector: 'app-instructioninfo-cloning-dialog',
  templateUrl: './instructioninfo-cloning-dialog.component.html',
  styleUrls: ['./instructioninfo-cloning-dialog.component.css']
})


export class InstructioninfoCloningDialogComponent implements OnInit {
  disableForSaving = false;
  selectedProcedureDet: ProcedureDetails;
  searchForProcedure = true;
  fetching = false;
  selectedInstructions: number[];
  isRedlineAdd: boolean = false;
  comment: RedLineComment = null;

  instructionsToClone: ProcedureInstruction[];

  @Input() procedureData: ProcedureDetails;
  @Output() procedureDataChange = new EventEmitter();


  constructor(public dialogRef: MatDialogRef<InstructioninfoCloningDialogComponent>,
              public instructionService: InstructionService,
              public errorDialog: MatDialog,
              public messageService: MessageService,
              @Inject(MAT_DIALOG_DATA) data,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.isRedlineAdd = data.redliningEnabled;
    if (this.isRedlineAdd) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  submitSelectionsToClone() {
    // clone here...
    this.disableForSaving = true;
    // send to server....

    if (this.selectedInstructions.length > 0) {
      if (this.isRedlineAdd) {
        this.saveInstructionCloneAsRedLine();
      } else {
        this.instructionService.cloneInstructionsToNewProcedure(this.selectedInstructions, this.procedureData.pk, this.selectedProcedureDet.procedureDefVersion).then((data) => {
          this.disableForSaving = false;
          this.handleCloningResults(data);
        });
      }
    } else {
      this.handleError('Missing Selections', 'No Instructions Selected For Clone', 'Selected instructions size is 0; cannot clone empty set')
    }
  }

  handleCloningResults(data: ProcedureInstruction[] & ErrMsg): void {
    if (!data.error) {
      data.forEach(pi => {
        this.procedureData.procedureInstructions.push(pi);
      });
      if (this.isRedlineAdd) {
        this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
      }
      this.procedureDataChange.emit(this.procedureData);
      this.messageService.showSnackBar('Instruction Sections Cloned', 'CLOSE');
      this.dialogRef.close();
    } else {
      this.handleError('Error cloning instructions', data.error, 'Error while cloning instructions to procedure with pk ' + this.procedureData.pk + ': ' + data.error);
    }
  }

  receiveProcedureSearchSelection(event) {
    this.selectedProcedureDet = event;
    this.loadProcedureDefinition();
  }


  // loads the procedure definition widget, hiding the search widget at the same time
  private loadProcedureDefinition() {
    this.searchForProcedure = false;
    this.fetching = true;

    this.loggerService.info('Retrieving instructions for the selected procedure details with pk ' + this.selectedProcedureDet.procedureDefVersion);
    this.instructionService.getInstructionSections(this.selectedProcedureDet.pk).then((data) => {
      if (data.error) {
        this.handleError('Error retrieving the instruction sections for selected procedure', data.error, 'Error retrieving instructions for the the selected procedure with pk ' + this.selectedProcedureDet.procedureDefVersion + ': ' + data.error)
      } else {
        this.instructionsToClone = data;
      }
      this.fetching = false;
    });
  }

  private handleError(description: string, errorMessage: string, loggerMessage?: string) {
    if (loggerMessage) this.loggerService.error(loggerMessage);
    this.errorDialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: errorMessage
      }
    });
  }

  // the user may be on procedure definition and wish to go back to the search; this function
  // hides the procedure defintion widget and displays the search, and deletes the current values of
  // selectedVersion and selectedProcedureDef
  private goBackToProcedureSearch() {
    this.searchForProcedure = true;
    this.selectedProcedureDet = undefined;
  }

  // closes the dialog
  private onCancel(): void {
    this.dialogRef.close();
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  cancelRedline(): void {
    if (this.isRedlineAdd) {
      this.messageService.showSnackBar('Red line addition(s) cancelled by user', 'CLOSE');
    }
    this.onCancel();
  }

  saveInstructionCloneAsRedLine(): void {
    // first check the comment is defined and not empty. We will apply this comment to all of the instructions being cloned
    if (_.isEmpty(this.comment.commentText)) {
      this.messageService.showSnackBar('Enter a red line comment to clone these instructions.', 'CLOSE');
      return;
    }

    const redLineData = new RedLine();
    redLineData.redLineComment = this.comment;
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.instructionPkList = this.selectedInstructions;

    this.instructionService.saveMultipleCopiedInstructionsAsRedLines(redLineData, this.selectedProcedureDet.procedureDefVersion).then((data) => {
      this.disableForSaving = false;
      this.handleCloningResults(data);
    });
  }
}
