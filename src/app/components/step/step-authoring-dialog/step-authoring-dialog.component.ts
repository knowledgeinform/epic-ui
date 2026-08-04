import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProcedurestepsComponent} from '../../procedure/proceduresteps/proceduresteps.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {UntypedFormBuilder} from '@angular/forms';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {StepdefinitionComponent} from '../stepdefinition/stepdefinition.component';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {Utils} from '@app/utils';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import * as _ from 'lodash';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-step-authoring-dialog',
  templateUrl: './step-authoring-dialog.component.html',
  styleUrls: ['./step-authoring-dialog.component.css']
})
export class StepAuthoringDialogComponent implements  AfterViewChecked {

  @Input() stepGroup: StepGroupDef;
  @Input() procedureData: ProcedureDetails;
  formForUpdatedStep: any;
  saving = false;
  @Output() stepGroupChange = new EventEmitter();
  @Output() procedureDataChange = new EventEmitter();
  @ViewChild(StepdefinitionComponent, /* TODO: add static flag */ {}) stepDefinitionComponent: StepdefinitionComponent;
  error: any;
  isRedLineAdd: boolean = false;

  constructor(public dialogRef: MatDialogRef<ProcedurestepsComponent>,
              private formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              private messageService: MessageService,
              private dialog: MatDialog,
              private validationService: RunValidationService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.procedureData = data.procedureData;
    this.stepGroup = data.stepGroup;
    this.isRedLineAdd = data.redliningEnabled;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }



  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  saveStep(): void {
    const formVal = this.formForUpdatedStep.value;
    if (formVal.type === 'TABLE' && this.stepDefinitionComponent.tableStepEntry.currentTable === undefined) {
      this.loggerService.warn('Table type is selected but no table created for new step in step group with pk ' + this.stepGroup.pk);
      this.messageService.showSnackBar('Must create table to save step', 'CLOSE');
      return;
    }

    this.saving = true;
    let stepTableRows = null;
    if (formVal.type === 'TABLE') {
      stepTableRows = this.stepDefinitionComponent.tableStepEntry.currentTable.stepTableRows;
    }
    // TODO: allow for adding attachments during authoring step
    // let stepDefAttachments = this.stepDefinitionComponent.stepDefAttachmentEntry.attachments as StepDefAttachment[];
    let stepData = new StepDef();
    stepData = Utils.updateStepFieldsFromForm(formVal, stepData, formVal.type, this.stepGroup.pk, stepTableRows, null);
    stepData.stepGroupDef = this.stepGroup;
    stepData.isManualValidation = false;

    if (this.isRedLineAdd) {
      this.saveNewRedLineStep(stepData);
    } else {
      this.saveNewNonRedLineStep(stepData);
    }
  }

  // FIXME: Refactor this to save new step and updated steps in same transaction
  saveNewNonRedLineStep(newStep: StepDef): void {
    // call EpicService to save step data to backend
    this.loggerService.info('Saving new step to step group with pk ' + this.stepGroup.pk, newStep.asDTO());
    this.epicService.saveStepData(newStep).subscribe((data) => {
      this.saving = false;
      if (data.error) {
        // error handling
        this.loggerService.error('Could not save new step; ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving new step',
            errorMessage: data.error
          }
        });
      } else {
        this.messageService.showSnackBar('New step saved', 'CLOSE');

        // TODO: Verify this logic with typechecking.
        this.procedureData.esd0 = this.procedureData.esd0 || data.esd0;

        // check that the procedure details of this step is also hazardous if the step is
        if (data.hazardous && !this.procedureData.hazardous) {
          this.procedureData.hazardous = true;
          this.loggerService.info('Marking procedure with pk ' + this.procedureData.pk + ' as hazardous due to new hazard step being added');
          this.messageService.showSnackBar('Marking procedure as hazardous. You must enter the hazard information ' +
            'on the header tab prior to submitting this procedure for approval.', 'CLOSE', 10000);
        }

        if (!this.stepGroup.stepDefs) {
          // if here, there are no steps currently in the array
          this.stepGroup.stepDefs = [];
          this.stepGroup.stepDefs.push(data);

          // emit the changed step group and procedure data
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step group ' + this.stepGroup.stepGroupName + ' updated', 'CLOSE');
        } else {
          this.stepGroup.stepDefs.splice(data.displayOrder - 1, 0, data);

          this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, data.displayOrder, this.stepGroup.stepDefs.length - 1);

          this.loggerService.info('Updating display orders for any existing steps that now follow the new step');
          this.epicService.updateStepData(_.slice(this.stepGroup.stepDefs, data.displayOrder), false).subscribe((steps) => {
            if (steps.error) {
              // error handling
              this.loggerService.error('Could not save updates to existing steps following new step with pk ' + data.pk);
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error updating step data',
                  errorMessage: data.error
                }
              });
            } else {
              // we need to update the procedure data with this changed step group now.
              this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, steps);

              // check that the procedure details is also hazardous if any step is hazardous
              steps.forEach(step => {
                // TODO: Verify this logic with typechecking.
                this.procedureData.esd0 = this.procedureData.esd0 || step.esd0;
                if (step.hazardous && !this.procedureData.hazardous) {
                  this.procedureData.hazardous = true;
                  this.loggerService.info('Marking procedure with pk ' + this.procedureData.pk + ' as hazardous due to new hazard step being added');
                  this.messageService.showSnackBar('Marking procedure as hazardous. You must enter the hazard information ' +
                    'on the header tab prior to submitting this procedure for approval.', 'CLOSE', 10000);
                }
              });

              // emit the changed procedure data
              this.procedureDataChange.emit(this.procedureData);
              this.messageService.showSnackBar('Step group ' + this.stepGroup.stepGroupName + ' updated', 'CLOSE');
            }
          });
        }
      }
    });
    this.dialogRef.close();
  }

  // receives the values from the the stepDefinition widget
  receiveStep(event) {
    if (event) {
      this.formForUpdatedStep = this.formBuilder.group(event.value);
    } else {
      this.formForUpdatedStep = null;
    }
  }

  saveNewRedLineStep(newStep: StepDef): void {
    // need to set the edit type of this step
    newStep.editType = EditType.REDLINE_ADD;

    // need a redline comment
    let redLineCommentForAdd;
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
        return;
      } else {
        redLineCommentForAdd = data;
      }

      const redLineForNewStep = new RedLine();
      redLineForNewStep.stepDef = newStep.asDTO();
      redLineForNewStep.procedureDetailsPk = this.procedureData.pk;
      redLineForNewStep.redLineComment = redLineCommentForAdd;

      // update the steps following this new step and add the updated steps to the redline data structure for updating on the server
      if (_.isEmpty(this.stepGroup.stepDefs)) {
        this.stepGroup.stepDefs = [];
        this.stepGroup.stepDefs.push(newStep);
      } else {
        this.stepGroup.stepDefs.splice(newStep.displayOrder - 1, 0, newStep);
        this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, newStep.displayOrder, this.stepGroup.stepDefs.length - 1);
        redLineForNewStep.stepDefList = _.map(_.slice(this.stepGroup.stepDefs, newStep.displayOrder), step => step.asDTO());
      }

      this.loggerService.info('Saving new step as red line addition, plus updating any following steps');
      // save the array
      this.epicService.saveStepArrayAsRedLines([redLineForNewStep]).subscribe((steps) => {
        this.saving = false;
        if (steps.error) {
          this.loggerService.error('Could not save red line for adding a new step or updating following steps: ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error saving red line add/edits',
              errorMessage: data.error,
            }
          });
        } else {
          this.messageService.showSnackBar('Red lines to steps saved', 'CLOSE');
          this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, steps);

          // check that the procedure details is also hazardous if any step is hazardous
          steps.forEach(step => {
            if (step.hazardous && !this.procedureData.hazardous) {
              this.procedureData.hazardous = true;
              this.loggerService.info('Marking procedure with pk ' + this.procedureData.pk + ' as hazardous due to new hazard step being added');
              this.messageService.showSnackBar('Marking procedure as hazardous. You must enter the hazard information ' +
                'on the header tab prior to submitting this procedure for approval.', 'CLOSE', 10000);
            }
            if (step.esd0 && !this.procedureData.esd0) {
              this.loggerService.info('Marking procedure with pk ' + this.procedureData.pk + ' as ESD0 due to new ESDO step being added');
              this.procedureData.esd0 = true;
            }
          });
          this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        }
        this.dialogRef.close();
      });
    });
  }
}
