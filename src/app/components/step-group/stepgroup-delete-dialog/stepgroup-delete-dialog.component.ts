import {Component, EventEmitter, HostListener, Inject, Input, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ProcedurestepgroupsComponent} from '../../procedure/procedurestepgroups/procedurestepgroups.component';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {EditType} from '@app/interfaces/edit-type.dto';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import {applyPatch, generate, observe, Operation, unobserve} from 'fast-json-patch';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-stepgroup-delete-dialog',
  templateUrl: './stepgroup-delete-dialog.component.html',
  styleUrls: ['./stepgroup-delete-dialog.component.css']
})
export class StepgroupDeleteDialogComponent {

  @Input() procedureData: ProcedureDetails;
  @Input() stepGroup: StepGroupDef;
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
    this.isRedlineDelete = data.redliningEnabled;
    if (this.isRedlineDelete) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.close();
  }



  deleteStepGroup() {
    this.disableForSaving = true;
    if (this.isRedlineDelete) {
      this.makeRedLineDelete();
    } else {
      
      let isTopLevel = false;
      let parentPk;

      // we want to save the group deletion and update the following groups (i.e. their display orders) in the same
      // transaction.

      // first get the array that's going to be updated. We just want the direct step group object, not the parents,
      // steps, or child groups, so we'll convert that into an array of simple group objects
      let arrayOfUpdatedGroupsForServer;
      if (this.stepGroup.stepGroupDefParent != null) {
        arrayOfUpdatedGroupsForServer  = this.convertStepGroupsToSimpleObjects(this.stepGroup.stepGroupDefParent.stepGroupDefsChildren);
        parentPk = this.stepGroup.stepGroupDefParent.pk;
      } else {
        arrayOfUpdatedGroupsForServer  = this.convertStepGroupsToSimpleObjects(this.procedureData.stepGroupDefs);
        isTopLevel = true;
        parentPk = this.procedureData.pk;
      }
      // find the index of the group to be removed
      const indexOfRemovedStepGroup = arrayOfUpdatedGroupsForServer.findIndex(grp => grp.pk === this.stepGroup.pk); 

      // create a patch to hold the array of operations.
      const patch = [];

      // create a json patch observer that will watch for changes
      const observer = observe(arrayOfUpdatedGroupsForServer);

      _.remove(arrayOfUpdatedGroupsForServer, group => group['displayOrder'] === indexOfRemovedStepGroup + 1)
      
      for (let i = indexOfRemovedStepGroup; i < arrayOfUpdatedGroupsForServer.length; i++) {
        arrayOfUpdatedGroupsForServer[i].displayOrder = i + 1;
      }

      // get a patch by generating operations from the observer.
      const restOfOperations = generate(observer);
      patch.push(...restOfOperations);

      // destroy the observer
      unobserve(arrayOfUpdatedGroupsForServer, observer);

      // send the patch to the server
      this.loggerService.info('Saving patch with deleted group and updated following groups; deleted group has pk ' + this.stepGroup.pk);
      this.epicService.patchStepGroupData(parentPk, isTopLevel, patch).subscribe((updatedGroups) => {
        this.disableForSaving = false;
        if (!updatedGroups.errorMessage) {
          if (isTopLevel) { 
            this.procedureData.stepGroupDefs = updatedGroups;
          } else {
            updatedGroups.forEach((grp)=> grp.stepGroupDefParent = this.stepGroup.stepGroupDefParent);
            this.stepGroup.stepGroupDefParent.stepGroupDefsChildren = updatedGroups; 
          }
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step group deleted, remaining step groups reordered.', 'CLOSE');
        } else {
          this.loggerService.error('Could not delete step group and/or update following groups: ' + updatedGroups.errorMessage);
          this.messageService.showSnackBar('Could not delete step group and/or update following groups due to error: ' + updatedGroups.errorMessage, 'CLOSE', 10000);
        }
      });
    }
    this.close();
  }

  private convertStepGroupsToSimpleObjects(array: StepGroupDef[]): Partial<StepGroupDef>[] {
    return _.map(array, group => {
      return {pk: group.pk,
        stepGroupName: group.stepGroupName,
        description: group.description,
        displayOrder: group.displayOrder};
    });
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  makeRedLineDelete(): void {
    // check that there is a comment
    if (_.isEmpty(this.comment.commentText)) {
      this.messageService.showSnackBar('Enter a red line comment to delete this step.', 'CLOSE');
      this.disableForSaving = false;
      return;
    }

    // update the step group edit type
    this.stepGroup.editType = EditType.REDLINE_DELETE;

    // create a red line object
    const redLineData = new RedLine();
    redLineData.stepGroupDef = this.stepGroup.asDTO();
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.redLineComment = this.comment;

    // call the service to save the redline
    this.loggerService.info('Saving as red line deletion of group with pk ' + this.stepGroup.pk);
    this.epicService.saveRedLineToStepGroup(redLineData, this.procedureData).subscribe((data) => {
      this.disableForSaving = false;
      if (!data.error) {
        _.merge(this.stepGroup, data);
        // replace this step group in the procedure data
        // this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, data);
        this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Red line deletion for step group saved', 'CLOSE');
        this.runValidationService.validateProcedure(this.procedureData);
      } else {
        this.loggerService.error('Could not delete as red line step group with pk ' + this.stepGroup.pk + ': ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error making a red-line delete of step group',
            errorMessage: data.error
          }
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  cancelRedline(): void {
    if (this.isRedlineDelete) {
      this.messageService.showSnackBar('Red line delete canceled by user', 'CLOSE');
    }
    this.close();
  }
}
