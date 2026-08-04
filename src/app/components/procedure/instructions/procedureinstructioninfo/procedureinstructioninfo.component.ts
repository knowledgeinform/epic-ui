import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {MessageService} from '@app/services/message.service';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLine} from '@app/interfaces/red-line.dto';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {ConfirmationDialogComponent, ConfirmationDialogModel} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';
import {InstructionService} from '@app/services/instruction.service';
import * as _ from 'lodash';
import {Utils} from '@app/utils';
import {UntypedFormGroup} from "@angular/forms";

@Component({
  selector: 'app-procedureinstructioninfo',
  templateUrl: './procedureinstructioninfo.component.html',
  styleUrls: ['./procedureinstructioninfo.component.css']
})
export class ProcedureinstructioninfoComponent implements OnInit {
  @Input() isReadonly: boolean;
  sectionTextSubscription: Subscription;
  @Input() isExpand: boolean;
  editingHeader = false;
  @Input() procedureData: ProcedureDetails;
  @Input() instruction: ProcedureInstruction;
  @Input() redliningEnabled: boolean = false;
  @Output() procedureDataChange = new EventEmitter();
  sectionName: string;
  sectionText: string;
  @Input() uiDisplayOrder: number;
  @Input() runPk = null;
  form: UntypedFormGroup;
  @Input() printMode: boolean = false;

  instrInfoMenuDisplay = false;

  constructor(public dialog: MatDialog,
              private messageService: MessageService,
              public instructionService: InstructionService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {

  }

  ngOnInit() {
    this.isExpand = this.instruction.editType !== EditType.REDLINE_DELETE;
    this.sectionName = this.instruction.sectionName;
    if(this.sectionText !== this.instruction.text) {
      this.sectionText = this.instruction.text;
    }

  }

  deleteSection(): void {
    const dialogData = new ConfirmationDialogModel('Delete Instruction Section',
      'Are you sure you want to delete this instruction section? This action cannot be undone.');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        const index = this.procedureData.procedureInstructions.map((e) => e.pk).indexOf(this.instruction.pk);
        if (this.redliningEnabled) {
          this.saveRedLineDelete();
        } else {
          this.instructionService.deleteInstructionSection(this.instruction.pk).then((deletedInstruction) => {
            if (deletedInstruction) {
              if (index > -1) {
                this.procedureData.procedureInstructions.splice(index, 1);

                // FIXME: At some point refactor so that the deletion and renumbering happen in one transaction.
                this.instructionService.renumberAndUpdateProcedureInstructions(this.procedureData.procedureInstructions, index, this.procedureData.procedureInstructions.length - 1)
                  .then(updatedInstructions => {
                    if (!updatedInstructions.error) {
                      this.procedureData.procedureInstructions = Utils.updateArrayWithNewElementsBasedOnPK(this.procedureData.procedureInstructions, updatedInstructions);
                      this.messageService.showSnackBar('Instruction Information Saved', 'CLOSE');
                      this.procedureDataChange.emit(this.procedureData);
                    } else {
                      this.handleError('Instruction Renumbering Failed', updatedInstructions.error, 'Could not save renumbered instructions for procedureDetails with pk: ' + this.procedureData.pk + '; ' + updatedInstructions.error);
                    }
                  });
              } else {
                this.handleError('Could Not Find Instruction', 'Problem updating the page after removing selected section. Please refresh the page.', 'Failed to find the deleted instruction in the procedureDetails; instruction pk: ' + this.instruction.pk);
              }
            } else {
              this.handleError('Deletion Error', 'Problem updating the page after removing selected section. Please refresh the page.', 'Instruction section failed to delete; pk: ' + this.instruction.pk);
            }
          });
        }
      }
    });
  }

  saveRedLineDelete(): void {
    let redLineCommentForDeletion;
    // open a dialog to get the redline comment
    this.openRedlineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        return;
      } else {
        redLineCommentForDeletion = data;
      }
      this.instruction.editType = EditType.REDLINE_DELETE;

      // create a red line object for a procedure step
      const redLineData = new RedLine();
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.procedureInstruction = this.instruction.asDTO();
      redLineData.redLineComment = redLineCommentForDeletion;

      // save the red line data object
      const loggerMessage = 'Red line deletion of instruction with pk ' + this.instruction.pk;
      this.instructionService.saveRedLineToProcedureInstruction(redLineData, loggerMessage).then((savedData) => {
        if (!savedData.error) {
          const indexOfThisInstruction = this.procedureData.procedureInstructions.findIndex(i => i.pk === this.instruction.pk);
          this.procedureData.procedureInstructions[indexOfThisInstruction] = _.merge(this.procedureData.procedureInstructions[indexOfThisInstruction], savedData);
          // TODO: Per EPIC-497, refactor
          this.isExpand = false;
          this.messageService.showSnackBar('Red line deletion for procedure instruction saved', 'CLOSE');
          this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        } else {
          this.handleError('Failed to save red line deletion of procedure instruction', savedData.error, 'Failed to save the red line deletion of procedure instruction with pk ' + this.instruction.pk + '; ' + savedData.error);
        }
      });
    });
  }

  saveRedLineEdit(instruction: ProcedureInstruction) {
    // changes to the procedure instruction should have already been made
    const redLineData = new RedLine();
    redLineData.procedureDetailsPk = this.procedureData.pk;

    // get a red line comment if none already
    let redLineCommentForEdit;
    this.openRedlineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        this.sectionName = this.instruction.sectionName;
        this.sectionText = this.instruction.text;
        return;
      } else {
        redLineCommentForEdit = data;
      }
      redLineData.redLineComment = redLineCommentForEdit;

      instruction.sectionName = this.sectionName;
      instruction.text = this.sectionText;
      if (instruction.editType !== EditType.REDLINE_ADD && instruction.editType !== EditType.REDLINE_DELETE) {
        instruction.editType = EditType.REDLINE_EDIT;
      }
      redLineData.procedureInstruction = instruction.asDTO();

      // save the redline
      this.saveRedLineInstruction(redLineData, true);
    });
  }

  saveRedLineInstruction(redLineData: RedLine, displayFinalMessage: boolean) {
    // save the redline
    this.instructionService.saveRedLineToProcedureInstruction(redLineData, 'Saving red line for instruction with pk: ' + this.instruction.pk).then((newData) => {
      if (!newData.error) {
        const indexOfThisInstruction = this.procedureData.procedureInstructions.findIndex(i => i.pk === this.instruction.pk);
        this.procedureData.procedureInstructions[indexOfThisInstruction] = newData;
        if (displayFinalMessage) {
          this.messageService.showSnackBar('Instruction(s) updated as red line edits', 'CLOSE');
          this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        }
      } else {
        this.handleError('Failed to save edit as red line for procedure instruction', newData.error, 'Could not save red line for procedure instruction;' + newData.error);
      }
    });
  }

  saveSections(sections: ProcedureInstruction[]): void {
    this.loggerService.info('Saving instructions for procedure details with pk ' + this.procedureData.pk);
    this.instructionService.updateInstructionInfoData(sections).then((isUpdated) => {
      if (isUpdated) {
        this.messageService.showSnackBar('Instruction Information Saved', 'CLOSE');
        this.procedureData.procedureInstructions = Utils.updateArrayWithNewElementsBasedOnPK(this.procedureData.procedureInstructions, isUpdated);
        this.procedureDataChange.emit(this.procedureData);
      } else {
        this.handleError('Error saving instructions', 'Could not save instruction changes', 'Failure while saving instructions for procedure with pk ' + this.procedureData.pk);
      }
    });
  }

  copySection(): void {
    const dialogData = new ConfirmationDialogModel('Copy Instruction Section', 'Do you want to make a copy of this instruction section? ' +
      'It will be added as the last section, you can move it to a new position after the copy is created.');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        if (this.redliningEnabled) {
          this.copySectionAsRedLine();
        } else {
          this.loggerService.info('Copying instruction with pk ' + this.instruction.pk);
          this.instructionService.copyInstructionSection(this.instruction.pk).then((data) => {
            this.handleCopyResult(data);
          });
        }
      }
    });
  }

  copySectionAsRedLine(): void {
    let redLineComment;
    this.openRedlineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        return;
      } else {
        redLineComment = data;
      }

      // create a red line object for a procedure step
      const redLineData = new RedLine();
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.procedureInstruction = this.instruction.asDTO();
      redLineData.redLineComment = redLineComment;

      // save the red line data object
      this.loggerService.info('Copying instruction as a red line', redLineData);
      this.instructionService.savedCopiedInstructionAsRedLine(redLineData).then((newInstruction) => {
        this.handleCopyResult(newInstruction);
      });
    });
  }

  private openRedlineCommentDialog(): MatDialogRef<RedBlackLineCommentDialogComponent, any> {
    return this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.RED_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
  }

  private handleCopyResult(data: any): void {
    if (!data.error) {
      this.procedureData.procedureInstructions.push(data);
      if (this.redliningEnabled) {
        this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
      }
      this.procedureDataChange.emit(this.procedureData);
      this.messageService.showSnackBar('Copy Instruction Section Complete', 'CLOSE');
    } else {
      this.handleError('Error copying instruction', data.error, 'Error while copying instruction with pk ' + this.instruction.pk + '; ' + data.error);
    }
  }

  private handleError(description: string, errorMessage: string, loggerMessage?: string) {
    if (loggerMessage) this.loggerService.error(loggerMessage);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: errorMessage
      }
    });
  }

  saveSection(instruction: ProcedureInstruction): void {
    if (this.isReadonly && !this.redliningEnabled) {
      return;
    }

    if (this.redliningEnabled){
      this.saveRedLineEdit(instruction);
    } else {
      this.saveSections([instruction]);
    }
  }

  receiveTextChange(event: string):  void {
    if(event && (event !== this.instruction.text)) {
        this.instruction.text = event;
        this.sectionText = event;
        this.instruction.sectionName = this.sectionName;
    }
  }

  updateSectionName(name: string): void {
    this.instruction.sectionName = name;
    this.sectionName = name;
  }
}


