import {Component, EventEmitter, HostListener, Inject, Input, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProcedurestepgroupsComponent} from '../../procedure/procedurestepgroups/procedurestepgroups.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import * as _ from 'lodash';
import {Utils} from '@app/utils';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-step-deleting-dialog',
  templateUrl: './step-deleting-dialog.component.html',
  styleUrls: ['./step-deleting-dialog.component.css']
})
export class StepDeletingDialogComponent {

  @Input() procedureData: ProcedureDetails;
  @Input() stepGroup: StepGroupDef;
  @Input() step: StepDef;
  @Output() procedureDataChange = new EventEmitter();
  isRedlineDelete: boolean = false;
  comment: RedLineComment = null;
  disableForSaving: boolean = false;
  constructor(public dialogRef: MatDialogRef<ProcedurestepgroupsComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private dialog: MatDialog,
              private runValidationService: RunValidationService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.stepGroup = data.stepGroup;
    this.step = data.step;
    this.isRedlineDelete = data.redliningEnabled;
    if (this.isRedlineDelete) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }



  deleteStep(): void {
    this.disableForSaving = true;
    if (this.isRedlineDelete) {
      this.makeRedLineDelete();
    } else {
      this.deleteNonRedLineStep();
    }
  }

  // FIXME: At some point refactor this to make deletion and step display order update happen in same call to backend
  deleteNonRedLineStep(): void {
    this.loggerService.info('Deleting step with pk ' + this.step.pk);
    this.epicService.deleteStep(this.step.pk).subscribe((data) => {
      this.disableForSaving = false;
      if (!data.error && data === true) {
        // remove the deleted step from the step group
        const index = this.stepGroup.stepDefs.findIndex(step => step.pk === this.step.pk);
        this.stepGroup.stepDefs.splice(index, 1);

        this.messageService.showSnackBar('Step', 'Deleted!');

        this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, index, this.stepGroup.stepDefs.length - 1);
        this.loggerService.info('Updating display order for steps following the deleted step');
        this.epicService.updateStepData(_.slice(this.stepGroup.stepDefs, index), false).subscribe((updatedSteps) => {
          // TODO: Verify this check works. There is contradictory code throughout EPIC that indicates `error` should be on the list itself, or on elements in the list. Looking at the `EpicWSService.handleError()`, it looks like the property gets placed on the list, not the elements.
          if (data.error) {
            this.showErrorDialog('Error updating step display order', data.error);
          } else {
            this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, updatedSteps);
            this.messageService.showSnackBar('Steps', 'Updated!');
            // emit change
            this.procedureDataChange.emit(this.procedureData);
          }
        });
      } else {
        this.loggerService.error('Could not delete step with pk ' + this.step.pk + ': ' + data.error);
        this.showErrorDialog('Error deleting step', data.error ? data.error : 'Step deletion returned false');
      }
    });
    this.dialogRef.close();
  }

  showErrorDialog(description: string, error): void {
    this.loggerService.error(description + ': ' + error);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: error
      }
    });
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  cancelRedline(): void {
    if (this.isRedlineDelete) {
      this.messageService.showSnackBar('Red line delete cancelled by user', 'CLOSE');
    }
    this.dialogRef.close();
  }

  makeRedLineDelete(): void {
    if (_.isEmpty(this.comment.commentText)) {
      this.loggerService.warn('Missing a red line comment for deleting step with pk ' + this.step.pk);
      this.messageService.showSnackBar('Enter a red line comment to delete this step.', 'CLOSE');
      return;
    }
    // update step edit type
    this.step.editType = EditType.REDLINE_DELETE;

    // create a red line object
    const redLineData = new RedLine();
    redLineData.stepDef = this.step.asDTO();
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.redLineComment = this.comment;

    // save the redline
    this.loggerService.info('Deleting as a red line step with pk ' + this.step.pk);
    this.epicService.saveStepArrayAsRedLines([redLineData]).subscribe((data) => {
      this.disableForSaving = false;
      if (!data.error) {
        // place this step in the step group and update procedureData
        const index = this.stepGroup.stepDefs.findIndex(step => step.pk === this.step.pk);
        this.stepGroup.stepDefs[index] = data[0];
        // this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, this.stepGroup);
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Step red line deletion saved', 'CLOSE');
        this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
        this.runValidationService.validateProcedure(this.procedureData);
        this.dialogRef.close();
      } else {
        this.showErrorDialog('Error making a red-line delete of step', data.error);
      }
    });
  }
}
