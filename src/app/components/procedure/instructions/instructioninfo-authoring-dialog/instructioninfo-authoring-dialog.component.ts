import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLine} from '@app/interfaces/red-line.dto';
import {MessageService} from '@app/services/message.service';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {LoggerService} from '@app/services/logger.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {InstructionService} from '@app/services/instruction.service';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';
import {Utils} from '@app/utils';

@Component({
  selector: 'app-instructioninfo-authoring-dialog',
  templateUrl: './instructioninfo-authoring-dialog.component.html',
  styleUrls: ['./instructioninfo-authoring-dialog.component.css']
})
export class InstructioninfoAuthoringDialogComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();
  redliningEnabled: boolean = false;
  comment: RedLineComment = null;
  saving = false;

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<InstructioninfoAuthoringDialogComponent, InstructioninfoAuthoringDialogData>,
              private formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) data,
              public instructionService: InstructionService,
              public messageService: MessageService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureDetails;
    this.redliningEnabled = data.redliningEnabled;
    this.redliningEnabled = !!this.redliningEnabled;
    if (this.redliningEnabled) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      procedureDetails: [this.procedureData],
      sectionName: ['', [Validators.maxLength(100), Validators.required]],
      displayOrder: [this.procedureData.procedureInstructions.length + 1,
        [Validators.max(this.procedureData.procedureInstructions.length + 1), Validators.min(1), Validators.required]]
    });
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  saveSectionEnter(event): void {
    if (event.key === 'Enter') {
      this.saveSection();
    }
  }

  saveSection(): void {
    if (this.form.valid) {
      if (!this.redliningEnabled) {
        this.saving = true;
        const formValue = this.form.value;
        const instruction = _.assign(new ProcedureInstruction(), formValue);
        this.instructionService.saveInstructionInfoSection(instruction).then(instructionsFromServer => {
          this.saving = false;
          _.assign(this.procedureData.procedureInstructions, instructionsFromServer);
          this.procedureDataChange.emit(this.procedureData);
          this.close();
        });
      } else {
        // if here, this is a redline addition
        if (_.isEmpty(this.comment.commentText)) {
          this.messageService.showSnackBar('Red line comment is required', 'CLOSE');
          return;
        }
        this.saving = true;

        // create a new instruction
        const instruction = _.assign(new ProcedureInstruction(), this.form.value);
        instruction.editType = EditType.REDLINE_ADD;
        instruction.procedureDetails = this.procedureData;
        // instruction.sectionName = this.form.get('sectionName').value;
        // instruction.displayOrder = this.form.get('displayOrder').value;

        // create redline data object
        const redLineData = new RedLine();
        redLineData.procedureDetailsPk = this.procedureData.pk;
        redLineData.redLineComment = this.comment;
        redLineData.procedureInstruction = instruction.asDTO();

        // save the data object

        this.instructionService.saveRedLineToProcedureInstruction(redLineData, 'Saving new instruction as a red line addition to: ' + this.procedureData.id).then(savedData => {
          if (!savedData.error) {
            const index = savedData.displayOrder - 1;
            this.procedureData.procedureInstructions.splice(index, 0, savedData);
            this.messageService.showSnackBar('Red line addition of procedure instruction saved, ' +
              'now updating display number for any following instructions', 'CLOSE');

            if (savedData.displayOrder !== this.procedureData.procedureInstructions.length) {
              // FIXME: Ideally the instruction reordering would be part of same transaction as saving the redlined instruction.
              this.instructionService.renumberAndUpdateProcedureInstructions(this.procedureData.procedureInstructions, index + 1, this.procedureData.procedureInstructions.length - 1).then(instructions => {
                // replace the element in the procedureInstructions array with the updated instructions from the server
                if (!instructions.error) {
                  this.procedureData.procedureInstructions = Utils.updateArrayWithNewElementsBasedOnPK(this.procedureData.procedureInstructions, instructions);
                  this.messageService.showSnackBar('Instruction display orders updated', 'CLOSE');
                } else {
                  this.handleError('Failed to update display orders of procedure instructions', 'Could not update display orders for procedure instructions: ' + instructions.error);
                }
              });
            }
            this.saving = false;
            this.redLineReportingService.findInstructionLineEditsForProcedure(this.procedureData);
            this.procedureDataChange.emit(this.procedureData);
            this.close();
            return;
          } else {
            this.handleError('Failed to save red line addition of procedure instruction', 'Could not save red line addition of procedure instruction: ' + savedData.error);
            this.close();
          }
        });
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  cancelRedline(): void {
    if (this.redliningEnabled) {
      this.messageService.showSnackBar('Red line add cancelled by user', 'CLOSE');
    }
    this.close();
  }

  handleError(errorMessage: string, loggerMessage?: string): void {
    if (loggerMessage) this.loggerService.error(loggerMessage);
    this.messageService.showSnackBar(errorMessage, 'CLOSE');
  }
}

export interface InstructioninfoAuthoringDialogData {
  redliningEnabled: boolean;
  procedureDetails: ProcedureDetails;
}
