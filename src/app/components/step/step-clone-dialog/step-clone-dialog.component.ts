import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {Utils} from '@app/utils';
import {MessageService} from '@app/services/message.service';
import {RedLine} from '@app/interfaces/red-line.dto';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import { SGNode } from '@app/components/multi-select-groups-steps/multi-select-groups-steps.component';

@Component({
  selector: 'app-step-clone-dialog',
  templateUrl: './step-clone-dialog.component.html',
  styleUrls: ['./step-clone-dialog.component.css']
})
export class StepCloneDialogComponent implements OnInit {

 disableForSaving = false;
 searchForProcedure = true;
 fetching = false;

 @Input() procedureData: ProcedureDetails;
 @Output() procedureDataChange = new EventEmitter();

 checklistSelection = new SelectionModel<SGNode>(true);
 sgSelectionsMade: boolean = false;

 isRedlineAdd: boolean = false;
 comment: RedLineComment = null;

  allDestinationOptions = [];
  destGroupSelected: StepGroupDef;
  groupsInTheSelectedProcedure: StepGroupDef[] = [];

  @Input() selectedProcedureData: ProcedureDetails;

  constructor(public dialogRef: MatDialogRef<StepCloneDialogComponent>,
              public epicService: EPICWSService,
              public errorDialog: MatDialog,
              public messageService: MessageService,
              @Inject(MAT_DIALOG_DATA) data,
              protected runValidationService: RunValidationService,
              protected redLineReportingService: LineEditReportingService,
              protected loggerService: LoggerService
  ) {
    this.procedureData = data.procedureData;
    this.isRedlineAdd = data.redliningEnabled;
    if (this.isRedlineAdd) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  ngOnInit() {
    this.allDestinationOptions = Utils.createGroupListingOptions(this.procedureData.stepGroupDefs, null, true, null, true);
  }

  setDestSelection(value): void {
    this.destGroupSelected = value;
  }

  submitSelectionsToClone() {
    this.sgSelectionsMade = true;
  }

  goBackToSelection() {
    this.sgSelectionsMade = false;
    if (this.isRedlineAdd) {
      // if this is a redline, clear the comment.
      this.comment.commentText = '';
    }
  }
  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }
  clone(): void {
    this.disableForSaving = true;
    // send to server....
    const steps: StepDef[] = [];
    const groups: StepGroupDef[] = [];
    this.checklistSelection.selected.forEach(sg => {
      if (!sg.isParent) {
        steps.push(sg.leaf);
      } else {
        const stepGroup = _.find(this.groupsInTheSelectedProcedure, sgd => sgd.pk === sg.pk);
        if (stepGroup.stepDefs.length === 0) {
          // if here, we have an empty subgroup that has been selected for copying
          groups.push(stepGroup);
        }
      }
    });
    if (steps.length > 0 || groups.length > 0) {
      if (this.isRedlineAdd) {
        this.saveRedLineClone(steps, groups);
      } else {
        this.loggerService.info('Cloning selected steps/groups to step group with pk ' + this.destGroupSelected.pk);
        this.epicService.cloneStepsToNewProcedure(steps, groups, this.procedureData.pk, this.destGroupSelected.pk).subscribe((data) => {
          this.disableForSaving = false;
          if (!data.error) {
            data.forEach(group => {
              if (group.stepGroupDefParent != null) {
                // add to group
                const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, group.stepGroupDefParent.pk);
                if (foundGroup != null) {
                  if (foundGroup.stepGroupDefsChildren === null || foundGroup.stepGroupDefsChildren === undefined) {
                    foundGroup.stepGroupDefsChildren = [];
                  }
                  foundGroup.stepGroupDefsChildren.push(group);
                } else {
                  this.loggerService.error('Cannot find the destination step group to which to add the cloned group with pk ' + group.pk);
                  this.errorDialog.open(ErrorDialogComponent, {
                    data: {
                      description: 'Error cloning steps',
                      errorMessage: 'ERROR: Unable to find step group to add cloned item'
                    }
                  });
                }
              } else {
                // add as root group
                if (this.procedureData.pk === group.procedureDetails.pk) {
                  this.procedureData.stepGroupDefs.push(group);
                } else {
                  this.loggerService.error('Cannot add the cloned group as a top-level group to procedure with pk ' + this. procedureData.pk);
                  this.errorDialog.open(ErrorDialogComponent, {
                    data: {
                      description: 'Error cloning steps',
                      errorMessage: 'ERROR: Unable to add cloned item to as root group'
                    }
                  });
                }
              }
            });
            this.procedureDataChange.emit(this.procedureData);
            this.messageService.showSnackBar('Steps Cloned', 'CLOSE');
            this.dialogRef.close();
          } else {
            this.loggerService.error('Could not clone steps/groups: ' + data.error);
            this.errorDialog.open(ErrorDialogComponent, {
              data: {
                description: 'Error cloning steps',
                errorMessage: data.error
              }
            });
          }
        });
      }
    } else {
      this.loggerService.warn('Did not select any steps for cloning to destination group with pk ' + this.destGroupSelected.pk);
      this.errorDialog.open(ErrorDialogComponent, {
        data: {
          errorMessage: 'No Steps Selected For Clone'
        }
      });
    }
  }

  receiveStepsSelection(event) {
    this.checklistSelection = event;
  }

  receiveGroupsSelection(event) {
    this.groupsInTheSelectedProcedure = event;
  }

  receiveProcedureSearchSelection(event) {
    this.searchForProcedure = false;
    this.selectedProcedureData = event;
    this.loggerService.info('Loading step group for selected procedure revision with name ' + this.selectedProcedureData.id);
  }

  // the user may be on procedure definition and wish to go back to the search; this function
  // hides the procedure defintion widget and displays the search, and deletes the current values of
  // selectedProcedureData
  private goBackToProcedureSearch() {
    this.searchForProcedure = true;
    this.selectedProcedureData = undefined;
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }
// closes the dialog
protected onCancel(): void {
  this.dialogRef.close();
}
  cancelRedline(): void {
    if (this.isRedlineAdd) {
      this.messageService.showSnackBar('Red line addition(s) cancelled by user', 'CLOSE');
    }
    this.onCancel();
  }

  saveRedLineClone(steps: StepDef[], groups: StepGroupDef[]): void {
    // first check the comment is defined and not empty. We will apply this comment to all of the steps and groups being cloned
    if (_.isEmpty(this.comment.commentText)) {
      this.loggerService.warn('Missing a red line comment when trying to clone steps/groups');
      this.messageService.showSnackBar('Enter a red line comment to clone these steps.', 'CLOSE');
      return;
    }

    const redLineData = new RedLine();
    redLineData.redLineComment = this.comment;
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.stepGroupDef = this.destGroupSelected.pk === -1 ? {pk: this.destGroupSelected.pk} : this.destGroupSelected.asDTO(); // this is the parent group
    redLineData.stepDefList = _.map(steps, s => s.asDTO());
    redLineData.stepGroupDefList = _.map(groups, group => group.asDTO());

    this.loggerService.info('Cloning steps/groups as red lines to destination group with pk ' + this.destGroupSelected.pk);
    this.epicService.saveMultipleCopiedStepsAsRedLines(redLineData).subscribe((data) => {
      this.disableForSaving = false;
      if (!data.error) {
        data.forEach(group => {
          if (group.stepGroupDefParent != null) {
            // add to group
            const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, group.stepGroupDefParent.pk);
            if (foundGroup != null) {
              if (foundGroup.stepGroupDefsChildren === null || foundGroup.stepGroupDefsChildren === undefined) {
                foundGroup.stepGroupDefsChildren = [];
              }
              foundGroup.stepGroupDefsChildren.push(group);
              // TODO: Is this necessary?
              // this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, foundGroup);
            } else {
              this.loggerService.error('Cannot find the destination step group to which to add the cloned group with pk ' + group.pk + ' as a red line');
              this.errorDialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error cloning steps',
                  errorMessage: 'ERROR: Unable to find step group to add cloned item'
                }
              });
            }
          } else {
            // add as root group
            if (this.procedureData.pk === group.procedureDetails.pk) {
              this.procedureData.stepGroupDefs.push(group);
            } else {
              this.loggerService.error('Cannot add cloned group with pk ' + group.pk + ' to the run with procedure detail pk ' + this.procedureData.pk + ' as a red line');
              this.errorDialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error cloning steps',
                  errorMessage: 'ERROR: Unable to add cloned item to as root group'
                }
              });
            }
          }
        });
        this.redLineReportingService.findStepLineEditsForProcedure(this.procedureData);
        this.runValidationService.validateProcedure(this.procedureData);
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Steps Cloned', 'CLOSE');
      } else {
        this.loggerService.error('Could not clone steps/groups as red lines: ' + data.error);
        this.errorDialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error cloning steps',
            errorMessage: data.error
          }
        });
      }
    });
    this.onCancel();
  }
}
