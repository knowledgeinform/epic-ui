import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MessageService} from '@app/services/message.service';
import {ProcedurestepgroupsComponent} from '../../procedure/procedurestepgroups/procedurestepgroups.component';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {EditType} from '@app/interfaces/edit-type.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {RedLine} from '@app/interfaces/red-line.dto';
import {Utils} from '@app/utils';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-stepgroup-move-dialog',
  templateUrl: './stepgroup-move-dialog.component.html',
  styleUrls: ['./stepgroup-move-dialog.component.css']
})
export class StepgroupMoveDialogComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  @Input() stepGroup: StepGroupDef;
  @Output() procedureDataChange = new EventEmitter();
  saving = false;
  parentSelected: StepGroupDef;
  allOptions = [];
  olderSibling: StepGroupDef;
  originalArrayOfThisStepGroup: StepGroupDef[];
  originalIndexOfThisStepGroup: number;
  newArrayForThisStepGroup: StepGroupDef[];
  entityType: string;
  isRedlineEdit: boolean = false;
  comment: RedLineComment = null;
  constructor(public dialogRef: MatDialogRef<ProcedurestepgroupsComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private dialog: MatDialog,
              private redLineReportingService: LineEditReportingService,
              private runValidationService: RunValidationService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.stepGroup = data.stepGroup;
    this.isRedlineEdit = data.redliningEnabled;
    if (this.isRedlineEdit) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
    this.entityType = 'Step Group';
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    // here we need to generate an array of all the step group options and populate allStepGroupOptions
    // while doing that, we also need to determine what array the current step group is in and its index within that array

    this.allOptions = Utils.createGroupListingOptions(this.procedureData.stepGroupDefs, null, false, this.stepGroup.pk, true);

    if (this.stepGroup.stepGroupDefParent === null) {
      // this step group was originally a top level group
      this.originalArrayOfThisStepGroup = this.procedureData.stepGroupDefs;
    } else {
      this.findOriginalArrayOfThisStepGroup(this.procedureData.stepGroupDefs, this.stepGroup.stepGroupDefParent.pk);
    }
    this.originalIndexOfThisStepGroup = this.originalArrayOfThisStepGroup.findIndex(item => item.pk === this.stepGroup.pk);
  }

  findOriginalArrayOfThisStepGroup(arrayToSearch: StepGroupDef[], parentPkToFind: number): void {
    if (_.isEmpty(arrayToSearch)) {
      return;
    }
    arrayToSearch.forEach(sg => {
      if (sg.pk === parentPkToFind) {
        this.originalArrayOfThisStepGroup = sg.stepGroupDefsChildren;
      } else {
        if (sg.stepGroupDefsChildren !== null && sg.stepGroupDefsChildren !== undefined && sg.stepGroupDefsChildren.length > 0) {
          this.findOriginalArrayOfThisStepGroup(sg.stepGroupDefsChildren, parentPkToFind);
        }
      }
    });
  }

  receiveMovingChange(event): void {
    this.newArrayForThisStepGroup = event.newArray;
    this.olderSibling = event.olderSibling.item;
    this.parentSelected = event.parentSelected;
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  updateStepGroup(): void {
    // here we need to transfer the current step group from the original array to the new array.
    // find the new index the step group will occupy
    let newIndexForThisStepGroup = 0;


    // evaluate if the step group has stayed inside its current parent
    let thisStepGroupCurrentParentPk = -1;
    if (this.stepGroup.stepGroupDefParent !== null && this.stepGroup.stepGroupDefParent !== undefined) {
      // if here, step group is not a top level group originally
      thisStepGroupCurrentParentPk = this.stepGroup.stepGroupDefParent.pk;
    }

    if (this.parentSelected.pk === thisStepGroupCurrentParentPk) {
      // step group has stayed within its original group
      if (this.olderSibling.pk !== -1) {
        if (this.originalIndexOfThisStepGroup >= this.olderSibling['displayOrder']) {
          newIndexForThisStepGroup = this.olderSibling['displayOrder'];
        } else {
          newIndexForThisStepGroup = this.olderSibling['displayOrder'] - 1;
        }
      }
      moveItemInArray(this.originalArrayOfThisStepGroup, this.originalIndexOfThisStepGroup, newIndexForThisStepGroup);
    } else {
      // step group has changed arrays
      if (this.olderSibling.pk !== -1) {
        newIndexForThisStepGroup = this.olderSibling['displayOrder'];
      }
      transferArrayItem(this.originalArrayOfThisStepGroup, this.newArrayForThisStepGroup, this.originalIndexOfThisStepGroup,
        newIndexForThisStepGroup);
    }
    if (this.isRedlineEdit) {
      this.saveRedLineEdit(thisStepGroupCurrentParentPk, newIndexForThisStepGroup);
    } else {
      this.saveNonRedlinedMovedStepGroup(thisStepGroupCurrentParentPk, newIndexForThisStepGroup);
    }
  }

  saveNonRedlinedMovedStepGroup(thisStepGroupCurrentParentPk: number, newIndexForThisStepGroup: number): void {
    this.saving = true;
    const stepGroupDataArray = [];
    let originalIndexStart;
    let originalIndexEnd;
    if (this.parentSelected.pk !== thisStepGroupCurrentParentPk) {
      // the step group moved to a new parent array, so all of the siblings behind this group in the original array need updating
      originalIndexStart = this.originalIndexOfThisStepGroup;
      originalIndexEnd = this.originalArrayOfThisStepGroup.length - 1;
    } else {
      originalIndexStart = Math.min(this.originalIndexOfThisStepGroup, newIndexForThisStepGroup);
      originalIndexEnd = Math.max(this.originalIndexOfThisStepGroup, newIndexForThisStepGroup);
    }

    // go through the original array and update display orders, add to the data array
    this.originalArrayOfThisStepGroup = Utils.updateDisplayOrdersForArrayItems(this.originalArrayOfThisStepGroup, originalIndexStart, originalIndexEnd);
    stepGroupDataArray.push(..._.slice(this.originalArrayOfThisStepGroup, originalIndexStart, originalIndexEnd + 1));

    if (this.parentSelected.pk !== thisStepGroupCurrentParentPk) {
      // if here, the step group did move arrays, because the selected parent is not same as its current parent.
      this.newArrayForThisStepGroup = Utils.updateDisplayOrdersForArrayItems(this.newArrayForThisStepGroup, newIndexForThisStepGroup, this.newArrayForThisStepGroup.length - 1);
      if (this.parentSelected.pk === -1) {
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].stepGroupDefParent = null;
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].procedureDetails = this.procedureData;
      } else {
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].stepGroupDefParent = this.parentSelected;
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].procedureDetails = null;
      }
      stepGroupDataArray.push(..._.slice(this.newArrayForThisStepGroup, newIndexForThisStepGroup));
    }
    // now update the database
    this.loggerService.info('Saving moved step group with pk ' + this.stepGroup.pk + ' and updating affected groups');
    this.epicService.updateStepGroupData(stepGroupDataArray, this.procedureData).subscribe((data) => {
      this.saving = false;
      if (!data.error) {
        data.forEach(sg => {
          let index = this.originalArrayOfThisStepGroup.findIndex(group => group.pk === sg.pk);
          if (index === -1) {
            index = this.newArrayForThisStepGroup.findIndex(group => group.pk === sg.pk);
            _.merge(this.newArrayForThisStepGroup[index], sg);
          } else {
            _.merge(this.originalArrayOfThisStepGroup[index], sg);
          }
        });
        // insert the updated arrays into Procedure Data
        this.insertArraysIntoProcedureData(thisStepGroupCurrentParentPk);
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Step group information saved', 'CLOSE');
      } else {
        this.loggerService.error('Could not save move for step group with pk ' + this.stepGroup.pk + ' or changes to affected groups: ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving step group changes',
            errorMessage: data.error,
          }
        });
      }
      this.close();
    });
  }

  private replaceArrayInProcedureDataWithChangedArray(arrayToSearch: StepGroupDef[], revisedChildArray: StepGroupDef[],
                                                      parentPkToLookFor: number): boolean {
    let found = false;
    if (_.isEmpty(arrayToSearch)) {
      return found;
    }
    arrayToSearch.forEach(sg => {
      if (sg.pk !== null && sg.pk !== undefined) {
         if (sg.pk === parentPkToLookFor) {
           // we found the parent; need to replace this parent's child step groups with the revisedChildArray
           sg.stepGroupDefsChildren = revisedChildArray;
           found = true;
           return found;
         } else {
           // this sg group is not the parent group we want; check its children
           if (sg.stepGroupDefsChildren !== null && sg.stepGroupDefsChildren !== undefined &&
             sg.stepGroupDefsChildren.length > 0) {
             found = this.replaceArrayInProcedureDataWithChangedArray(sg.stepGroupDefsChildren, revisedChildArray,
               parentPkToLookFor);
           }
         }
      }
    });
    return found;
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

  saveRedLineEdit(currentParentGroupPk: number, newIndexForThisStepGroup: number): void {
    // we need to save the step group with the redline comment from the user, then we need to update the display
    // orders in both arrays and save those step groups. Finally we need to update
    // the procedure data object and emit it and close the dialog.

    // first check the comment is defined and not empty
    if (_.isEmpty(this.comment.commentText)) {
      this.messageService.showSnackBar('Enter a red line comment to delete this step.', 'CLOSE');
      return;
    }

    this.saving = true;

    let originalIndexStart;
    let originalIndexEnd;
    if (this.parentSelected.pk !== currentParentGroupPk) {
      // the step group moved to a new parent array, so all of the siblings behind this group in the original array need updating
      originalIndexStart = this.originalIndexOfThisStepGroup;
      originalIndexEnd = this.originalArrayOfThisStepGroup.length - 1;
      if (this.newArrayForThisStepGroup[newIndexForThisStepGroup].editType !== EditType.REDLINE_DELETE &&
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].editType !== EditType.REDLINE_ADD) {
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].editType = EditType.REDLINE_EDIT;
      }
    } else {
      // if here, the step group is still in its original group
      originalIndexStart = Math.min(this.originalIndexOfThisStepGroup, newIndexForThisStepGroup);
      originalIndexEnd = Math.max(this.originalIndexOfThisStepGroup, newIndexForThisStepGroup);
      if (this.originalArrayOfThisStepGroup[newIndexForThisStepGroup].editType !== EditType.REDLINE_DELETE &&
        this.originalArrayOfThisStepGroup[newIndexForThisStepGroup].editType !== EditType.REDLINE_ADD) {
        this.originalArrayOfThisStepGroup[newIndexForThisStepGroup].editType = EditType.REDLINE_EDIT;
      }
    }

    const stepGroupArray: StepGroupDef[] = [];

    this.originalArrayOfThisStepGroup = Utils.updateDisplayOrdersForArrayItems(this.originalArrayOfThisStepGroup, originalIndexStart, originalIndexEnd);
    stepGroupArray.push(..._.slice(this.originalArrayOfThisStepGroup, originalIndexStart, originalIndexEnd + 1));

    // now check if need to update display order in the "new" array too. We only need to do this if the step group
    // has moved arrays.
    if (this.parentSelected.pk !== currentParentGroupPk) {
      // if here, the step group did move arrays, because the selected parent is not same as its current parent.
      this.newArrayForThisStepGroup = Utils.updateDisplayOrdersForArrayItems(this.newArrayForThisStepGroup, newIndexForThisStepGroup, this.newArrayForThisStepGroup.length - 1);
      if (this.parentSelected.pk === -1) {
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].stepGroupDefParent = null;
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].procedureDetails = this.procedureData;
      } else {
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].stepGroupDefParent = this.parentSelected;
        this.newArrayForThisStepGroup[newIndexForThisStepGroup].procedureDetails = null;
      }
      stepGroupArray.push(..._.slice(this.newArrayForThisStepGroup, newIndexForThisStepGroup));
    }
    const redlineData = new RedLine();
    redlineData.procedureDetailsPk = this.procedureData.pk;
    redlineData.stepGroupDef = this.parentSelected.pk !== currentParentGroupPk ? this.newArrayForThisStepGroup[newIndexForThisStepGroup].asDTO() : this.originalArrayOfThisStepGroup[newIndexForThisStepGroup].asDTO(); // sg.asDTO();
    redlineData.redLineComment = this.comment;

    const updatedGroups: StepGroupDef[] = _.filter(stepGroupArray, group => group.pk !== redlineData.stepGroupDef.pk);
    redlineData.stepGroupDefList = _.map(updatedGroups, group => group.asDTO());

    // we now have an array of redLine data objects. We need to save them.
    this.loggerService.info('Saving as a red line a move for group with pk ' + this.stepGroup.pk + ' and updating affected groups');
    this.epicService.saveRedLineArrayToStepGroup([redlineData]).subscribe((data) => {
      this.saving = false;
      if (!data.error) {
        // need to replace the groups in the array with the changed step groups
        data.forEach(sg => {
          let index = this.originalArrayOfThisStepGroup.findIndex(group => group.pk === sg.pk);
          if (index === -1) {
            index = this.newArrayForThisStepGroup.findIndex(group => group.pk === sg.pk);
            this.newArrayForThisStepGroup[index] = sg;
          } else {
            this.originalArrayOfThisStepGroup[index] = sg;
          }
        });
        this.replaceArrayInProcedureDataWithChangedArray(this.procedureData.stepGroupDefs, this.newArrayForThisStepGroup, this.parentSelected.pk);
        this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Red line edit due to a step group move saved', 'CLOSE');
        this.runValidationService.validateProcedure(this.procedureData);
      } else {
        this.loggerService.error('Could not save moved group as red line or changes to affected groups: ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving step group changes',
            errorMessage: data.error,
          }
        });
      }
    });
    this.close();
  }

  insertArraysIntoProcedureData(currentParentGroupPk: number): void {
    if (currentParentGroupPk === -1) {
      this.replaceArrayInProcedureDataWithChangedArray(this.originalArrayOfThisStepGroup, this.newArrayForThisStepGroup,
        this.parentSelected.pk);
      this.procedureData.stepGroupDefs = this.originalArrayOfThisStepGroup;
    } else if (this.parentSelected.pk === -1) {
      this.replaceArrayInProcedureDataWithChangedArray(this.newArrayForThisStepGroup, this.originalArrayOfThisStepGroup,
        currentParentGroupPk);
      this.procedureData.stepGroupDefs = this.newArrayForThisStepGroup;
    } else {
      let found = this.replaceArrayInProcedureDataWithChangedArray(this.originalArrayOfThisStepGroup, this.newArrayForThisStepGroup,
        this.parentSelected.pk);
      if (found) {
        // new array was a child of original array.
        this.replaceArrayInProcedureDataWithChangedArray(this.procedureData.stepGroupDefs, this.originalArrayOfThisStepGroup, currentParentGroupPk);
      } else {
        found = this.replaceArrayInProcedureDataWithChangedArray(this.newArrayForThisStepGroup, this.originalArrayOfThisStepGroup, currentParentGroupPk);
        if (found) {
          this.replaceArrayInProcedureDataWithChangedArray(this.procedureData.stepGroupDefs, this.newArrayForThisStepGroup, this.parentSelected.pk);
        } else {
          this.replaceArrayInProcedureDataWithChangedArray(this.procedureData.stepGroupDefs, this.originalArrayOfThisStepGroup, currentParentGroupPk);
          if (this.parentSelected.pk !== currentParentGroupPk) {
            this.replaceArrayInProcedureDataWithChangedArray(this.procedureData.stepGroupDefs, this.newArrayForThisStepGroup, this.parentSelected.pk);
          }
        }
      }
    }
  }
}
