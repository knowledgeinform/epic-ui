import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {Utils} from '@app/utils';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MessageService} from '@app/services/message.service';
import {RedLine} from '@app/interfaces/red-line.dto';
import * as _ from 'lodash';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-step-copy-dialog',
  templateUrl: './step-copy-dialog.component.html',
  styleUrls: ['./step-copy-dialog.component.css']
})
export class StepCopyDialogComponent implements OnInit {
  @Input() procedureData: ProcedureDetails;
  @Input() step: StepDef;
  groupSelected: StepGroupDef;
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();
  @Input() disableForSaving = false;
  allOptions = [];
  comment: RedLineComment = null;
  isRedlineAdd: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<StepCopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    public epicService: EPICWSService,
    public messageService: MessageService,
    private dialog: MatDialog,
    private runValidationService: RunValidationService,
    private redLineReportingService: LineEditReportingService,
    private loggerService: LoggerService) {

    this.procedureData = data.procedureData;
    this.step = data.step;
    this.isRedlineAdd = data.redliningEnabled;
    if (this.isRedlineAdd) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  setSelection(value): void {
    this.groupSelected = value;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.close();
  }

  ngOnInit() {
    this.allOptions = Utils.createGroupListingOptions(this.procedureData.stepGroupDefs, null, true, null, false);
  }

  // always copying steps to the END of the destination step group.
  copyStep(): void {
    this.disableForSaving = true;
    if (this.isRedlineAdd) {
      this.saveRedLineCopy();
    } else {
      this.loggerService.info('Copying step with pk ' + this.step.pk + ' to group with pk ' + this.groupSelected.pk);
      this.epicService.copyStepToGroup(this.step.pk, this.groupSelected.pk).subscribe((data) => {
        this.disableForSaving = false;
        if (!data.error) {

          // find the group in the procedure data and add this step to the end
          const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, data.stepGroupDef.pk);
          if (foundGroup != null) {
            if (foundGroup.stepDefs === null || foundGroup.stepDefs === undefined) {
              foundGroup.stepDefs = [];
            }
            foundGroup.stepDefs.push(data);
          } else {
            this.loggerService.error('Cannot find destination group for copied step with pk ' + data.pk);
            this.dialog.open(ErrorDialogComponent, {
              data: {
                description: 'Error adding copied step to step group',
                errorMessage: 'ERROR: Unable to find step group to add copied step'
              }
            });
          }
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step Copied', 'CLOSE');
        } else {
          this.loggerService.error('Error copying step with pk ' + this.step.pk + ': ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error copying step',
              errorMessage: data.error
            }
          });
        }
      });
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  cancelRedline(): void {
    if (this.isRedlineAdd) {
      this.messageService.showSnackBar('Red line addition cancelled by user', 'CLOSE');
    }
    this.close();
  }

  // a red line copy is basically a red line add function - we are adding a new step (a duplicate of this one) to a new group
  saveRedLineCopy(): void {
    // first check the comment is defined and not empty
    if (_.isEmpty(this.comment.commentText)) {
      this.loggerService.warn('Missing a red line comment for copying step with pk ' + this.step.pk);
      this.messageService.showSnackBar('Enter a red line comment to copy this step.', 'CLOSE');
      return;
    }

    const redLineData = new RedLine();
    redLineData.redLineComment = this.comment;
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.stepGroupDef = this.groupSelected.asDTO();
    redLineData.stepDef = this.step.asDTO();

    this.loggerService.info('Copying step as a redline for step with pk ' + this.step.pk + ' to group with pk ' + this.groupSelected.pk);
    this.epicService.saveCopiedStepAsRedLine(redLineData).subscribe((newStep) => {
      this.disableForSaving = false;
      if (!newStep.error) {
        // find the group in the procedure data and add this step to the end
        const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, newStep.stepGroupDef.pk);
        if (foundGroup != null) {
          if (foundGroup.stepDefs === null || foundGroup.stepDefs === undefined) {
            foundGroup.stepDefs = [];
          }
          foundGroup.stepDefs.push(newStep);
        } else {
          this.loggerService.error('Could not find the destination step group for red line copy of step with pk ' + newStep.pk);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error adding copied step to step group',
              errorMessage: 'ERROR: Unable to find step group to add copied step'
            }
          });
        }
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Step copied as a red line addition', 'CLOSE');
        this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
        this.runValidationService.validateProcedure(this.procedureData);
      } else {
        this.loggerService.error('Could not copy step as a red line from step with pk ' + this.step.pk + ': ' + newStep.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving red line add from step copy',
            errorMessage: newStep.error
          }
        });
      }
    });
    this.close();
  }
}
