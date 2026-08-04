import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProcedurestepgroupsComponent} from '../../procedure/procedurestepgroups/procedurestepgroups.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {Utils} from '@app/utils';
import {RedLine} from '@app/interfaces/red-line.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import * as _ from 'lodash';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {LoginService} from '@app/services/login.service';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-step-moving-dialog',
  templateUrl: './step-moving-dialog.component.html',
  styleUrls: ['./step-moving-dialog.component.css']
})
export class StepMovingDialogComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  @Input() step: StepDef;
  @Output() procedureDataChange = new EventEmitter();
  parentSelected: StepGroupDef;
  allOptions = [];
  olderSibling: StepDef;
  entityType: string;
  originalStepGroup: StepGroupDef;
  originalIndexOfThisStep: number;
  isRedlineEdit: boolean = false;
  comment: RedLineComment = null;
  saving: boolean = false;

  constructor(public dialogRef: MatDialogRef<ProcedurestepgroupsComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private dialog: MatDialog,
              private loginService: LoginService,
              private runValidationService: RunValidationService,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.step = data.step;
    this.entityType = 'Step';
    this.originalStepGroup = data.stepGroup;
    this.isRedlineEdit = data.redliningEnabled;
    if (this.isRedlineEdit) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.allOptions = Utils.createGroupListingOptions(this.procedureData.stepGroupDefs, null, true, null, false);
    this.originalIndexOfThisStep = this.originalStepGroup.stepDefs.findIndex(item => item.pk === this.step.pk);
  }

  receiveMovingChange(event): void {
    this.olderSibling = event.olderSibling.item as StepDef;
    const allGroups = Utils.getAllGroupsForGroups(this.procedureData.stepGroupDefs);
    this.parentSelected = _.find(allGroups, group => group.pk === (event.parentSelected as StepGroupDef).pk);
  }

  updateStep(): void {

    // NB: `this.olderSibling` and `this.parentSelected` should have already been updated by subscription.

    this.saving = true;

    const oldIndex = _.findIndex(this.originalStepGroup.stepDefs, step => step.pk === this.step.pk);
    let newIndex = 0; 
    if (this.olderSibling.pk !== -1 ) { //StepgroupMoveDialogComponent returns a step with pk -1 if item should be placed first.
      newIndex = _.findIndex(this.parentSelected.stepDefs, step => step.pk === this.olderSibling.pk)
      if (_.findIndex(this.parentSelected.stepDefs, step => step.pk === this.step.pk) == -1 || newIndex < oldIndex ) { 
        // this step is NOT inside the same group or it is in the same group but befind the one it will be after  
        newIndex += 1; 
      }
    }
    // Move to new location.
    this.moveStep(this.step, this.originalStepGroup, oldIndex, this.parentSelected, newIndex);

    // Fix issue where steps may not have group, and where this is required for save to server:
    this.setStepGroupDef(this.originalStepGroup.stepDefs, this.originalStepGroup);
    this.setStepGroupDef(this.parentSelected.stepDefs, this.parentSelected);

    // Update lists' display orders, and build a list of updated steps.
    let updatedSteps: StepDef[] = [];
    updatedSteps.push(
      ...this.updateStepListDisplayOrders(this.originalStepGroup.stepDefs, this.isRedlineEdit),
      ...this.updateStepListDisplayOrders(this.parentSelected.stepDefs, this.isRedlineEdit)
    );
    updatedSteps = _.uniqBy(updatedSteps, s => s.pk);

    // Update server.
    if (this.isRedlineEdit) this.saveRedLineStepMove(updatedSteps);
    else this.saveNonRedLineStepMove(updatedSteps);

    this.close();

  }

  private saveNonRedLineStepMove(stepsToUpdate: StepDef[]): void {
    this.loggerService.info('Saving moved step with pk ' + this.step.pk + ' plus updating display orders of affected steps');
    this.epicService.updateStepData(stepsToUpdate, false).subscribe((updatedSteps) => {
      this.saving = false;

      // Handle errors.
      if (!updatedSteps || updatedSteps.error) {
        this.loggerService.error('Could not save moved step and/or changes to affected steps: ' + updatedSteps.error);
        this.openErrorDialog('Error updating steps after a move', updatedSteps);
        return;
      }

      this.resynchronizeLocalSteps(updatedSteps);

      this.procedureDataChange.emit(this.procedureData);
      this.messageService.showSnackBar('Step information updated', 'CLOSE');
    });

  }

  /**
   * Create redline edits and save them to the server.
   */
  private saveRedLineStepMove(stepsToUpdate: StepDef[]): void {
    const redlines: RedLine[] = this.convertStepsToRedlineData(stepsToUpdate);

    this.loggerService.info('Saving move of step as a redline for step with pk ' + this.step.pk + '; also updating affected steps');
    this.epicService.saveStepArrayAsRedLines(redlines).subscribe(updatedSteps => {

      this.saving = false;

      // Handle errors.
      if (!updatedSteps || updatedSteps.error) {
        this.loggerService.error('Could not save a step move as a red line: ' + updatedSteps.error);
        this.openErrorDialog('Error updating red lined steps', updatedSteps);
        return;
      }

      this.resynchronizeLocalSteps(updatedSteps);

      this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);

      this.runValidationService.validateProcedure(this.procedureData);

      this.procedureDataChange.emit(this.procedureData);

      this.messageService.showSnackBar('Red line edits due to a step move saved', 'CLOSE');

    });

  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  close(): void {
    this.dialogRef.close();
  }

  cancelRedline(): void {
    if (this.isRedlineEdit) {
      this.messageService.showSnackBar('Red line edit cancelled by user', 'CLOSE');
    }
    this.close();
  }

  /**
   * Creates a new RedLine array from `stepsArray`. A generic comment is added to each moved step. Also adds the redline to each step (which is required for the LineEditReportingService rollup).
   */
  private convertStepsToRedlineData(stepsArray: StepDef[]): RedLine[] {
    this.comment.users = this.loginService.getCurrentUser().asDTO();

    const redlineData = new RedLine();
    redlineData.procedureDetailsPk = this.procedureData.pk;
    redlineData.redLineComment = this.comment;

    // filter the step being redlined out from the array
    const redlinedStep = _.find(stepsArray, step => step.pk === this.step.pk);
    if (redlinedStep.editType !== EditType.REDLINE_DELETE && redlinedStep.editType !== EditType.REDLINE_ADD) {
      redlinedStep.editType = EditType.REDLINE_EDIT;
    }
    const renumberedSteps = _.filter(stepsArray, step => step.pk !== this.step.pk);

    redlineData.stepDef = redlinedStep.asDTO();
    redlineData.stepDefList = _.map(renumberedSteps, step => step.asDTO());
    redlineData.stepGroupDef = redlinedStep.stepGroupDef.asDTO();

    return [redlineData];
  }

  /**
   * Re-synchronize local data with server data, just in case something happened that shouldn't have happened. Updates `this.originalStepGroup` and `this.parentSelected`.
   */
  private resynchronizeLocalSteps(serverSteps: StepDef[]): void {
    const allSteps = [...this.originalStepGroup.stepDefs, ...this.parentSelected.stepDefs];
    serverSteps.forEach(updatedStep => {
      _.chain(allSteps).find(step => step.pk === updatedStep.pk).assign(updatedStep);
    });
  }

  /**
   * Updates step.displayOrder based on index in list. Optionally updates step.editType to be REDLINE_EDIT, unless it is already REDLINE_ADD or REDLINE_DELETE.
   * @argument isRedlineEdit When true, updates `step.editType` with appropriate redline type.
   * @returns A list steps that had their display orders updated.
   */
  private updateStepListDisplayOrders(list: StepDef[], isRedlineEdit: boolean): StepDef[] {
    const updatedSteps = [];
    list.forEach((step, i) => {
      const newDisplayOrder = i + 1;
      if (newDisplayOrder !== step.displayOrder || this.step.pk === step.pk) {
        updatedSteps.push(step);
        step.displayOrder = newDisplayOrder;
      }
    });
    return updatedSteps;
  }

  /**
   * Moves a step from a specified index in oldGroup to a specified index in newGroup. Also updates stepGroupDef.
   */
  // FIXME: Could this be simplified by using the transferArrayItem(oldArray, newArray, oldIndex, newIndex) angular function?
  // See stepgroup moving dialog for reference.
  private moveStep(step: StepDef, oldGroup: StepGroupDef, oldIndex: number, newGroup: StepGroupDef, newIndex: number) {

    if (!newGroup.stepDefs) newGroup.stepDefs = []; // Fix bug where sometimes array is not initialized.

    // Remove from previous list(s).
    oldGroup.stepDefs.splice(oldIndex, 1);
    if (oldGroup !== newGroup && oldGroup.pk === newGroup.pk) newGroup.stepDefs.splice(oldIndex, 1); // For some reason, these may be different objects representing the same group.

    // Add to new list.
    newGroup.stepDefs.splice(newIndex, 0, step);
    if (oldGroup !== newGroup && oldGroup.pk === newGroup.pk) oldGroup.stepDefs.splice(newIndex, 0, step); // TODO: Investigate why updating the old group is necessary (i.e. why there are different pointers to the same group).
    step.stepGroupDef = newGroup;
  }

  private setStepGroupDef(steps: StepDef[], group: StepGroupDef): void {
    steps.forEach(step => step.stepGroupDef = group);
  }

  private openErrorDialog(description: string, errorMessage: any): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { description, errorMessage }
    });
  }

}
