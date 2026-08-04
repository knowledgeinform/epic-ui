import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {StepAuthoringDialogComponent} from '../../step/step-authoring-dialog/step-authoring-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {EPICWSService} from '@app/services/epic-ws.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MessageService} from '@app/services/message.service';
import {StepgroupMoveDialogComponent} from '../../step-group/stepgroup-move-dialog/stepgroup-move-dialog.component';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import {StepgroupDeleteDialogComponent} from '../../step-group/stepgroup-delete-dialog/stepgroup-delete-dialog.component';
import {StepgroupAuthoringDialogComponent} from '../../step-group/stepgroup-authoring-dialog/stepgroup-authoring-dialog.component';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLine} from '@app/interfaces/red-line.dto';
import {
  RedBlackLineCommentDialogComponent,
  RedBlackLineCommentDialogData
} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {Utils} from '@app/utils';
import {StepgroupCopyDialogComponent} from '@app/components/step-group/stepgroup-copy-dialog/stepgroup-copy-dialog.component';
import * as _ from 'lodash';
import {RunValidationService} from '@app/services/run-validation.service';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {Run} from '@app/interfaces/Run';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {StepDef} from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import { LineEditService } from '@app/services/line-edit.service';
import { RunDataEntryService } from '@app/services/run-data-entry.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';

@Component({
  selector: 'app-procedurestepgroups',
  templateUrl: './procedurestepgroups.component.html',
  styleUrls: ['./procedurestepgroups.component.css']
})
export class ProcedurestepgroupsComponent implements OnInit, OnChanges {

  @Input() blackliningEnabled: boolean = false;
  @Input() public run: Run = null; // Will be null if this is not a run.
  @Input() stepGroup: StepGroupDef;
  @Input() parentNumber: string;
  expandThis: boolean = false;
  @Input() expandChildren: boolean;
  @Input() procedureData: ProcedureDetails;
  @Input() myStepGroupParent: StepGroupDef;
  @Input() isReadonly: boolean = true;
  @Input() disableStepPerformancePlaceholders: boolean = false;
  editingHeader = false;
  @Output() procedureDataChange = new EventEmitter();
  @Output() public childStepValueChanged = new EventEmitter<void>();
  stepsVisible = false;
  idName: string;
  stepTextSubscription: Subscription;
  public keyUp = new Subject();
  stepGroupMenuDisplay = false;
  panelOpenState = false;
  stepGroupName: string = '';
  stepGroupDescription: string = '';
  public isValid: boolean = false;
  public displayRunCloseoutStickyComments: boolean = false;
  public RunStatus = RunStatus;
  public displayGroupRedLines: boolean = false;
  groupDragIsDone: boolean = true;
  stepDragIsDone: boolean = true;
  public EditType = EditType;

  constructor(
    private dialog: MatDialog,
    public epicService: EPICWSService,
    private runValidationService: RunValidationService,
    private messageService: MessageService,
    private redLineReportingService: LineEditReportingService,
    private loggerService: LoggerService,
    public lineEditService: LineEditService,
    private runDataEntryService: RunDataEntryService,
    private lineEditStateService: LineEditStateService) {
    // this bit is for purposes of changing the name/description of a step group
    this.stepTextSubscription = this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(2000),
      distinctUntilChanged()).subscribe(value => {
      if (this.stepGroup.editType === EditType.REDLINE_DELETE || (!this.procedureData.redliningEnabled && this.isReadonly)) {
        return;
      }
      if (this.procedureData.redliningEnabled) {
        this.saveRedLineEdit(this.stepGroup);
      } else {
        this.saveNameAndDescriptionChange();
      }
    });
    this.updateStepLineEditsSubscription();
    this.runDataEntryService.runStepChanged.subscribe(step => {
      // this.stepGroup.stepDefs = Utils.updateArrayWithNewElementsBasedOnPK(this.stepGroup.stepDefs, [step]);
      const stepIndex = this.stepGroup.stepDefs.findIndex(stepInGroup => stepInGroup.pk === step.pk);
      if (stepIndex >= 0) {
        _.merge(this.stepGroup.stepDefs[stepIndex], step);
        this.onChildStepValueChanged();
      }
    })
  }

  updateStepLineEditsSubscription(): void {
    this.lineEditService.blackLineEditChanged.subscribe(blackLine => {
      if (!this.procedureData || blackLine?.stepDef?.pk == null) {
        return;
      }

      this.lineEditStateService.applySavedBlackLine(this.procedureData, blackLine);
    });
  }

  ngOnInit() {
    // the expansion panel of the step group gets an id, and this id is generated here. This ID is used by the anchor functionality on the
    // nav panel so that when a user clicks on the anchor icon in the nav panel, the main content opens the associated step group and all
    // its children step groups and scrolls the screen to that step group. DO NOT CHANGE THIS ID WITHOUT ALSO CHANGING THE ANCHOR
    // FUNCTIONALITY IN PROCEDURESTEPSNAVLIST OR YOU WILL BREAK THIS FUNCTIONALITY. If you must change how this ID is generated, make sure
    // whatever you will yield a UNIQUE id; if two expansion panels have the same id, the anchor functionality will not work correctly.
    this.setIdName();
    this.stepGroup.stepGroupDefParent = this.myStepGroupParent;
    this.stepGroupName = this.stepGroup.stepGroupName;
    this.stepGroupDescription = this.stepGroup.description;
  }

  public renderVisible($event): void {
    if (!this.stepsVisible && $event.visible) {
      this.stepsVisible = $event.visible;
    }
  }

  groupIdentity = (index: number, item: StepGroupDef) => item.pk;

  stepIdentity = (index: number, item: StepDef) => item.pk;

  // TODO: Why such a complicated id? Why not just 'step_group_pk_*'?
  private setIdName() {
    this.idName = 'p' + this.stepGroup.pk + '_' + this.stepGroup.stepGroupName.split(' ').join('_').split('.').join('_');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stepGroup) this.validateGroup();

    // in this method we only care about changes to expandChildren; if it's undefined, do nothing
    const expectedChange = changes.expandChildren;
    if (expectedChange === null || expectedChange === undefined) {
      return;
    }
    if (expectedChange.previousValue !== expectedChange.currentValue) {
      this.expandThis = expectedChange.currentValue;
    }
  }

  // this function opens the "add step" dialog.
  addStep(): void {
    const dialogRef = this.dialog.open(StepAuthoringDialogComponent, {
      width: '95vw',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: null,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.validateProcedure();
    });
  }


  // this function works in conjunction with the goTo function in procedurestepsnavlist, so refer to the comments there too. This function
  // intercepts the emitted anchor event and compares the parameters of that event to this step group. If this step group is the secondary
  // target, we check to see if it has a parent. If it does, the parent panel has to be expanded first, so we create a new click event
  // where the secondary target is the parent, and dispatch that - the parent step group will intercept it and expand. Once that happens,
  // this expansion panel expands. If this expansion panel has children step groups, those also expand.
  toggleExpandThis(thisInput): void {
    if (thisInput.detail.secondaryTarget === this.stepGroup.pk) {
      if (this.myStepGroupParent !== null && this.myStepGroupParent !== undefined) {
        const parentElem = document.getElementById('p' + this.myStepGroupParent.pk + '_' +
          this.myStepGroupParent.stepGroupName.split(' ').join('_').split('.').join('_'));
        const data = {
          'input': thisInput.detail.input, 'primaryTarget': thisInput.detail.primaryTarget,
          'secondaryTarget': this.myStepGroupParent.pk
        };
        const clickEvent = new CustomEvent('click', {detail: data});
        parentElem.dispatchEvent(clickEvent);
      }
      this.expandThis = thisInput.detail.input;
    }
    if (thisInput.detail.primaryTarget === this.stepGroup.pk) {
      this.expandThis = true;
    }
  }

  // saves changes to the step group name and description
  saveNameAndDescriptionChange(): void {
    if (this.stepGroup) {
      const cloneGroup = _.cloneDeep(this.stepGroup);
      cloneGroup.stepGroupName = this.stepGroupName;
      cloneGroup.description = this.stepGroupDescription;
      this.loggerService.info('Saving changes to name/description for group with pk ' + this.stepGroup.pk + ': Name=' + cloneGroup.stepGroupName + ', Description=' + cloneGroup.description);
      this.epicService.updateStepGroupData([cloneGroup], this.procedureData).subscribe((data) => {
        if (!data.error && Array.isArray(data) && (<StepGroupDef[]>data).length > 0) {
          // make sure the save was successful by re-applying the name and description from the server response
          const newGroup = <StepGroupDef>data[0];
          // assign value back from the server
          this.stepGroup.stepGroupName = newGroup.stepGroupName;
          this.stepGroup.description = newGroup.description;
          this.messageService.showSnackBar('Step Group Information', 'Saved!');
          // emit changes
          this.procedureDataChange.emit(this.procedureData);
          this.setIdName();
        } else {
          this.loggerService.error('Could not save changes to step group name/description: ' + data.error);
          this.handleError('Error saving step group changes', data.error);
        }
      });
    }
  }

  private handleError(description: string, errorMessage: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        description: description,
        errorMessage: errorMessage,
      }
    });
  }

  collapseAllChildren(): void {
    this.panelOpenState = false;
    this.expandThis = false;
    if (this.stepGroup.stepGroupDefsChildren !== null && this.stepGroup.stepGroupDefsChildren !== undefined) {
      this.expandChildren = false;
    }
  }

  toggleExpandAllChildren(): void {
    if (this.stepGroup.stepGroupDefsChildren !== null && this.stepGroup.stepGroupDefsChildren !== undefined) {
      this.expandChildren = !this.expandChildren;
    }
  }

  // this method deals with drag and drop of this step group's child groups
  drop(event: any): void {
    this.groupDragIsDone = false;

    if (this.procedureData.redliningEnabled) {
      this.saveRedLineEditsFromDragAndDropOfSubgroups(event);
    } else {
      if (this.stepGroup.stepGroupDefsChildren[event.previousIndex]['editType'] === 'REDLINE_DELETE') {
        return;
      }
      moveItemInArray(this.stepGroup.stepGroupDefsChildren, event.previousIndex, event.currentIndex);

      const startingIndex = Math.min(event.previousIndex, event.currentIndex);
      const endIndex = Math.max(event.previousIndex, event.currentIndex);
      this.stepGroup.stepGroupDefsChildren = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepGroupDefsChildren, startingIndex, endIndex);

      // update the database
      this.loggerService.info('Updating display orders after group with pk ' + this.stepGroup.stepGroupDefsChildren[event.currentIndex] + ' was drag & dropped to a new position');
      this.epicService.updateStepGroupData(_.slice(this.stepGroup.stepGroupDefsChildren, startingIndex, endIndex + 1), this.procedureData).subscribe((data) => {
        this.groupDragIsDone = true;
        if (!data.error) {
          // update the display order on the HTML elements
          data.forEach(sg => {
            this.stepGroup.stepGroupDefsChildren[sg.displayOrder - 1] = sg;
          });
          this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, this.stepGroup);
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step Group Reordering', 'Saved!');
          this.validateProcedure();
        } else {
          this.loggerService.error('Could not save drag and drop of step group with pk ' + this.stepGroup.pk + ': ' + data.error);
          this.handleError('Error saving step group changes', data.error);
        }
      });
    }
  }

  dropStep(event: any): void {
    this.stepDragIsDone = false;
    if (this.procedureData.redliningEnabled) {
      this.saveRedLineEditsFromDragAndDropOfSteps(event);
    } else {
      moveItemInArray(this.stepGroup.stepDefs, event.previousIndex, event.currentIndex);

      const startingIndex = Math.min(event.previousIndex, event.currentIndex);
      const endingIndex = Math.max(event.previousIndex, event.currentIndex);
      this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, startingIndex, endingIndex);

      this.loggerService.info('Saving drag and drop of step with pk ' + this.stepGroup.stepDefs[event.currentIndex].pk);
      this.epicService.updateStepData(_.slice(this.stepGroup.stepDefs, startingIndex, endingIndex + 1), false).subscribe((data) => {
        this.stepDragIsDone = true;
        if (!data.error) {
          // TODO: Test that this bit works
          data.forEach(step => {
            _.merge(this.stepGroup.stepDefs[step.displayOrder - 1], step);
          });
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step information updated', 'CLOSE');
          this.validateProcedure();
        } else {
          this.loggerService.error('Could not save drag and drop of step with pk ' + this.stepGroup.stepDefs[event.currentIndex].pk + '; ' + data.error);
          this.handleError('Error updating steps', data.error);
        }
      });
    }
  }

  moveStepGroup() {
    const dialogRef = this.dialog.open(StepgroupMoveDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        redliningEnabled: this.procedureData.redliningEnabled,
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.validateProcedure();
    });
  }

  deleteStepGroup() {
    const dialogRef = this.dialog.open(StepgroupDeleteDialogComponent, {
      width: '500px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.validateProcedure();
    });
  }

  copyStepGroup() {
    const dialogRef = this.dialog.open(StepgroupCopyDialogComponent, {
      width: '500px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.validateProcedure();
    });
  }

  addSubgroup(): void {
    this.dialog.open(StepgroupAuthoringDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        parentStepGroup: this.stepGroup,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  saveRedLineEdit(stepGroup: StepGroupDef): void {
    const redLineData = new RedLine();
    redLineData.procedureDetailsPk = this.procedureData.pk;

    // get a red line comment if none already
    let redLineCommentForEdit;

    this.openRedBlackLineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'X');
        this.stepGroupName = stepGroup.stepGroupName;
        this.stepGroupDescription = stepGroup.description;
        return;
      } else {
        redLineCommentForEdit = data;
      }
      redLineData.redLineComment = redLineCommentForEdit;

      stepGroup.stepGroupName = this.stepGroupName;
      stepGroup.description = this.stepGroupDescription;
      if (stepGroup.editType !== EditType.REDLINE_ADD && stepGroup.editType !== EditType.REDLINE_DELETE) {
        stepGroup.editType = EditType.REDLINE_EDIT;
      }

      redLineData.stepGroupDef = stepGroup.asDTO();

      // save the redline
      this.loggerService.info('Saving red line to step group', redLineData);
      this.epicService.saveRedLineToStepGroup(redLineData, this.procedureData).subscribe((newData) => {
        if (!newData.error) {
          _.merge(this.stepGroup, newData);
          this.messageService.showSnackBar('Step group updated as red line edits', 'CLOSE');
          this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        } else {
          this.loggerService.error('Failed to save red line for step group with pk ' + this.stepGroup.pk + ': ' + newData.error);
          this.handleError('Failed to red line for step group', newData.error);
        }
      });
    });
  }

  // this method deals with saving redline edits to this step group's subgroups that have been dragged/dropped to a new location.
  // note that this method is fairly similar to its counterpart in procedurestepscontainer
  saveRedLineEditsFromDragAndDropOfSubgroups(event: CdkDragDrop<Observable<any>>): void {
    // get a red line comment
    let redLineCommentForEdit;
    this.openRedBlackLineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        this.groupDragIsDone = true;
        return;
      } else {
        redLineCommentForEdit = data;
      }

      moveItemInArray(this.stepGroup.stepGroupDefsChildren, event.previousIndex, event.currentIndex);

      if (this.stepGroup.stepGroupDefsChildren[event.currentIndex].editType !== EditType.REDLINE_ADD &&
        this.stepGroup.stepGroupDefsChildren[event.currentIndex].editType !== EditType.REDLINE_DELETE) {
        this.stepGroup.stepGroupDefsChildren[event.currentIndex].editType = EditType.REDLINE_EDIT;
      }

      const startingIndex = Math.min(event.currentIndex, event.previousIndex);
      const endingIndex = Math.max(event.currentIndex, event.previousIndex);
      this.stepGroup.stepGroupDefsChildren = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepGroupDefsChildren, startingIndex, endingIndex);

      const redLineData = new RedLine();
      redLineData.redLineComment = redLineCommentForEdit;
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.stepGroupDef = this.stepGroup.stepGroupDefsChildren[event.currentIndex].asDTO();

      const nonRedlineGroupsToUpdate = _.filter(this.stepGroup.stepGroupDefsChildren, group => {
        return group.pk !== this.stepGroup.stepGroupDefsChildren[event.currentIndex].pk && group.displayOrder > startingIndex && group.displayOrder <= endingIndex + 1;
      });

      // we are going to save the updated step groups not as separate redlines (unneeded per EPIC-699), but as the stepGroupList on the RedLine data structure.
      redLineData.stepGroupDefList = _.map(nonRedlineGroupsToUpdate, group => group.asDTO());

      // save this moved subgroup
      this.loggerService.info('Saving drag and drop as a red line for step group with pk ' + this.stepGroup.stepGroupDefsChildren[event.currentIndex].pk);
      this.epicService.saveRedLineArrayToStepGroup([redLineData]).subscribe(updates => {
        this.groupDragIsDone = true;
        if (!updates.error) {
          // TODO: Test that this can come out
          updates.forEach(sg => {
            this.stepGroup.stepGroupDefsChildren = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.stepGroup.stepGroupDefsChildren, sg);
          });
          this.messageService.showSnackBar('Step group(s) updated as red line edits', 'CLOSE');
          this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
        } else {
          this.loggerService.error('Could not save red line drag and drop for step group with pk ' + this.stepGroup.pk + ': ' + data.error);
          this.handleError('Error saving step group red line', updates.error);
        }
      });
    });
  }

  // this method deals with saving redline edits due to drag and drop of steps within a step group.
  saveRedLineEditsFromDragAndDropOfSteps(event: CdkDragDrop<Observable<any>>): void {
    // get a red line comment
    let redLineCommentForEdit;
    this.openRedBlackLineCommentDialog().afterClosed().subscribe((data) => {
      if (data === null) {
        this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
        this.stepDragIsDone = true;
        return;
      } else {
        redLineCommentForEdit = data;
      }

      moveItemInArray(this.stepGroup.stepDefs, event.previousIndex, event.currentIndex);

      if (this.stepGroup.stepDefs[event.currentIndex].editType !== EditType.REDLINE_ADD &&
        this.stepGroup.stepDefs[event.currentIndex].editType !== EditType.REDLINE_DELETE) {
        this.stepGroup.stepDefs[event.currentIndex].editType = EditType.REDLINE_EDIT;
      }

      const startingIndex = Math.min(event.currentIndex, event.previousIndex);
      const endingIndex = Math.max(event.currentIndex, event.previousIndex);
      this.stepGroup.stepDefs = Utils.updateDisplayOrdersForArrayItems(this.stepGroup.stepDefs, startingIndex, endingIndex);

      const nonRedlineStepsToUpdate = _.filter(this.stepGroup.stepDefs, step => step.pk !== this.stepGroup.stepDefs[event.currentIndex].pk);

      // we are going to save the updated steps not as separate redlines (unneeded per EPIC-699), but as the stepList on the RedLine data structure.
      const redLineData = new RedLine();
      redLineData.redLineComment = redLineCommentForEdit;
      redLineData.procedureDetailsPk = this.procedureData.pk;
      redLineData.stepDef = this.stepGroup.stepDefs[event.currentIndex].asDTO();
      redLineData.stepDefList = _.slice(_.map(nonRedlineStepsToUpdate, step => step.asDTO()), startingIndex, endingIndex + 1);

      this.loggerService.info('Saving drag and drop as a red line for step with pk ' + this.stepGroup.stepDefs[event.currentIndex].pk);
      this.epicService.saveStepArrayAsRedLines([redLineData]).subscribe((steps) => {
        this.stepDragIsDone = true;
        if (!steps.error) {
          steps.forEach(step => {
            _.merge(this.stepGroup.stepDefs[step.displayOrder - 1], step);
          });
          this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
          this.procedureDataChange.emit(this.procedureData);
          this.messageService.showSnackBar('Step information updated', 'CLOSE');
        } else {
          this.loggerService.error('Could not save drag and drop as a red line for step with pk ' + this.stepGroup.stepDefs[event.currentIndex].pk + ': ' + steps.error);
          this.handleError('Error saving step red line edit', steps.error);
        }
      });
    });
  }

  private openRedBlackLineCommentDialog(): MatDialogRef<RedBlackLineCommentDialogComponent, any> {
    return this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.RED_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
  }

  private validateProcedure() {
    if (this.run === null) return;
    this.runValidationService.validateProcedure(this.procedureData);
    this.validateGroup();
  }

  private validateGroup() {
    if (this.run === null) return; // don't evaluate if this is not a run.
    const validation = this.runValidationService.validateStepGroup(this.procedureData.pk, this.stepGroup);
    this.isValid = validation === null;
  }

  public onChildStepValueChanged() {
    this.validateGroup();
  }
}
