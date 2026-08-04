import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {StepdefinitionComponent} from '../stepdefinition/stepdefinition.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProcedurestepsComponent} from '../../procedure/proceduresteps/proceduresteps.component';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {StepType} from '@app/interfaces/step-type.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {Utils} from '@app/utils';
import {EditType} from '@app/interfaces/edit-type.dto';
import {
  RedBlackLineCommentDialogComponent,
  RedBlackLineCommentDialogData
} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import {StepDefAttachment} from '@app/interfaces/attachment';
import {StepDisplayNamePipe} from '@app/pipes/step-display-name.pipe';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import * as _ from 'lodash';
import {RunValidationService} from '@app/services/run-validation.service';
import {StepDef} from '@app/interfaces/step-def.interface';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';


@Component({
  selector: 'app-step-editing-dialog',
  templateUrl: './step-editing-dialog.component.html',
  styleUrls: ['./step-editing-dialog.component.css']
})
export class StepEditingDialogComponent implements OnChanges {

  stepGroup: StepGroupDef;
  procedureData: ProcedureDetails;
  step: StepDef;
  isRedLineEdit: boolean = false;
  data: any;
  formForUpdatedStep: UntypedFormGroup;
  @Output() stepGroupChange = new EventEmitter();
  @Output() procedureDataChange = new EventEmitter();
  @Output() stepChange = new EventEmitter();
  @ViewChild(StepdefinitionComponent, {static: true}) stepDefinitionComponent: StepdefinitionComponent;
  error: any;
  saving = false;
  public StepType = StepType;
  hideCancel: boolean = false;
  showUpdateButton: boolean = true;

  constructor(public dialogRef: MatDialogRef<ProcedurestepsComponent>,
              private formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              private messageService: MessageService,
              private dialog: MatDialog,
              private validationService: RunValidationService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.stepGroup = data.stepGroup;
    this.step = data.step;
    this.isRedLineEdit = data.redliningEnabled;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formForUpdatedStep) {
      this.setUpdateButton();
    }
  }

  // this method receives an updated form from the embedded stepDefinition widget
  receiveStep(event): void {
    if (event) {
      this.formForUpdatedStep = this.formBuilder.group(event.value);
    } else
      this.formForUpdatedStep = null;
  }

  updateStep(): void {
    // create a data object for the step to send to the back end
    // note that the primary key is from the step object; it doesn't change
    // also step type remains the same; once a step is created as a certain type,
    // that type cannot change.
    this.saving = true;
    const formVal = this.formForUpdatedStep.value;
    let stepTableRows = null;
    if (this.step.type === StepType.TABLE) {
      stepTableRows = this.stepDefinitionComponent.tableStepEntry.currentTable.stepTableRows;
    }
    const stepDefAttachments = this.stepDefinitionComponent.stepDefAttachmentEntry.attachments as StepDefAttachment[];
    const updatedStep = Utils.updateStepFieldsFromForm(formVal, _.clone(this.step), this.step.type, this.stepGroup.pk, stepTableRows, stepDefAttachments);

    if (this.isRedLineEdit) {
      this.saveRedLinedStep(updatedStep);
    } else {
      this.saveNonRedLinedStep(updatedStep);
    }
  }

  saveNonRedLinedStep(updatedStep: StepDef) {
    // have the data object, save it. The update method on the backend expects an array.
    this.loggerService.info('Saving edits to step with pk ' + updatedStep.pk, updatedStep.asDTO());

    // we have an updated step. It needs to go into the stepDefs array on the group, the display orders need to be
    // updated for following steps, and then all of updated steps saved to the server.
    const oldIndexOfStep = this.stepGroup.stepDefs.findIndex(step => step.pk === updatedStep.pk);
    const newIndexOfStep = updatedStep.displayOrder - 1;

    const startingIndex = Math.min(oldIndexOfStep, newIndexOfStep);
    const endingIndex = Math.max(oldIndexOfStep, newIndexOfStep);

    this.step = updatedStep;
    this.stepGroup.stepDefs[oldIndexOfStep] = this.step;
    if (startingIndex !== endingIndex) {
      // the step was moved to a different display order. Move it in the stepGroup.stepDefs array and update
      // all of the display orders for the affected steps in the array
      moveItemInArray(this.stepGroup.stepDefs, oldIndexOfStep, newIndexOfStep);
      this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, startingIndex, endingIndex);
    }

    this.epicService.updateStepData(_.slice(this.stepGroup.stepDefs, startingIndex, endingIndex + 1), true).subscribe((data) => {
      this.saving = false;
      if (data.error) {
        this.loggerService.error('Could not save edits to step: ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error updating step named ' + new StepDisplayNamePipe().transform(this.step),
            errorMessage: data.error
          }
        });
      } else {
        this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, data);
        this.messageService.showSnackBar(new StepDisplayNamePipe().transform(this.step) + ' updated', 'CLOSE');

        this.procedureData.esd0 = this.procedureData.esd0 || data[0].esd0;

        if (data[0].hazardous && !this.procedureData.hazardous) {
          this.procedureData.hazardous = true;
          this.loggerService.info('Marking procedure as hazardous due to step being marked hazardous');
          this.messageService.showSnackBar('Marking procedure as hazardous. You must enter the hazard information ' +
            'on the header tab prior to submitting this procedure for approval.', 'CLOSE', 10000);
        }
        this.stepChange.emit(this.step);

        // emit the changed procedure data
        this.procedureDataChange.emit(this.procedureData);

        this.dialogRef.close();
      }
    });
  }

  saveRedLinedStep(redlinedStep: StepDef): void {
    const originalEditType = this.step.editType;
    this.step.editType = EditType.REDLINE_EDIT;

    // need a redline comment
    let redLineCommentForEdit;
    const dialogRef = this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.RED_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        this.saving = false;
        // If the user cancels the redline, revert back to the original edit type
        this.step.editType = originalEditType;
        return;
      } else {
        redLineCommentForEdit = data;
      }

      const redLineData = new RedLine();
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.redLineComment = redLineCommentForEdit;

      if (redlinedStep.editType !== EditType.REDLINE_ADD && redlinedStep.editType !== EditType.REDLINE_DELETE) {
        redlinedStep.editType = EditType.REDLINE_EDIT;
      }

      const oldIndexOfStep = this.stepGroup.stepDefs.findIndex(step => step.pk === this.step.pk);
      this.stepGroup.stepDefs[oldIndexOfStep] = redlinedStep;
      const newIndexOfStep = redlinedStep.displayOrder - 1;
      if (oldIndexOfStep !== newIndexOfStep) {
        // the step was moved to a different position. Move it in the stepGroup.stepDefs array and update
        // the display orders for the affected steps in the array
        moveItemInArray(this.stepGroup.stepDefs, oldIndexOfStep, newIndexOfStep);

        const startingIndex = Math.min(oldIndexOfStep, newIndexOfStep);
        const endingIndex = Math.max(oldIndexOfStep, newIndexOfStep);
        this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, startingIndex, endingIndex);

        // get the updated steps, minus the redlined step
        const updatedSteps = _.filter(_.slice(this.stepGroup.stepDefs, startingIndex, endingIndex + 1), step => step.pk !== redlinedStep.pk);
        redLineData.stepDefList = _.map(updatedSteps, step => step.asDTO());
      }
      redLineData.stepDef = redlinedStep.asDTO();

      // save the array
      this.loggerService.info('Saving as a red line an edited step with a pk ' + redlinedStep.pk + '; updating display order of any following steps');
      this.epicService.saveStepArrayAsRedLines([redLineData]).subscribe((steps) => {
        this.saving = false;
        if (steps.error) {
          this.loggerService.error('Could not update steps as redlines: ' + steps.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error saving red line edits',
              errorMessage: data.error,
            }
          });
        } else {
          this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, steps);

          // check that the procedure details is also hazardous if any step is hazardous
          steps.forEach(step => {
            if (step.hazardous && !this.procedureData.hazardous) {
              this.procedureData.hazardous = true;
              this.loggerService.info('Marking procedure as hazardous due to step being marked hazardous');
              this.messageService.showSnackBar('Marking procedure as hazardous. You must enter the hazard information ' +
                'on the header tab prior to submitting this procedure for approval.', 'CLOSE', 10000);
            }
            if (step.esd0 && !this.procedureData.esd0) {
              this.loggerService.info('Marking procedure as ESD0 due to step being marked ESD0');
              this.procedureData.esd0 = true;
            }
          });
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Red lines to steps saved', 'CLOSE');
          this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
          this.validationService.validateProcedure(this.procedureData);
        }
        this.dialogRef.close();
      });
    });
  }

  private setUpdateButton(): void {
    if (!this.formForUpdatedStep) this.showUpdateButton = false;
    const typeField = this.formForUpdatedStep.get('type');
    const type = this.step.type || (typeField ? typeField.value : null);
    if (!type) this.showUpdateButton = false;
    if (type === StepType.TABLE || this.step.type === StepType.TABLE) {
      const tse = this.stepDefinitionComponent.tableStepEntry;
      if ( !tse || !tse.currentTable ) this.showUpdateButton = false;
    }
    this.showUpdateButton = true;
  }

  public hideCancelButton(event): void {
    this.hideCancel = event;
  }
}
