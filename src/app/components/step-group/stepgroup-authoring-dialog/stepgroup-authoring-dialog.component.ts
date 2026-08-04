import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {ProcedurestepsComponent} from '../../procedure/proceduresteps/proceduresteps.component';
import {MessageService} from '@app/services/message.service';
import {RedLine} from '@app/interfaces/red-line.dto';
import {EditType} from '@app/interfaces/edit-type.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {LoggerService} from '@app/services/logger.service';
import {Utils} from '@app/utils';

@Component({
  selector: 'app-stepgroup-authoring-dialog',
  templateUrl: './stepgroup-authoring-dialog.component.html',
  styleUrls: ['./stepgroup-authoring-dialog.component.css']
})
export class StepgroupAuthoringDialogComponent implements OnInit {

  saving = false;
  @Input() procedureData: ProcedureDetails;
  @Input() parentStepGroup: StepGroupDef;
  isRedlineAdd: boolean = false;
  comment: RedLineComment = null;
  @Output() procedureDataChange = new EventEmitter();
  form: UntypedFormGroup;
  initialDisplayNumber: number = 1;

  constructor(public dialogRef: MatDialogRef<ProcedurestepsComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private formBuilder: UntypedFormBuilder,
              private redLineReportingService: LineEditReportingService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.parentStepGroup = data.parentStepGroup;
    this.isRedlineAdd = data.redliningEnabled;
    if (this.isRedlineAdd) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.parentStepGroup === null || this.parentStepGroup === undefined) {
      if (this.procedureData.stepGroupDefs !== null && this.procedureData.stepGroupDefs !== undefined) {
        this.initialDisplayNumber = this.procedureData.stepGroupDefs.length + 1;
        this.parentStepGroup = null;
      }
    } else {
      if (this.parentStepGroup.stepGroupDefsChildren !== null && this.parentStepGroup.stepGroupDefsChildren !== undefined) {
        this.initialDisplayNumber = this.parentStepGroup.stepGroupDefsChildren.length + 1;
      }
    }
    this.form = this.formBuilder.group({
      groupName: ['', [Validators.maxLength(100), Validators.required]],
      displayOrder: [this.initialDisplayNumber,
        [Validators.max(this.initialDisplayNumber), Validators.min(1), Validators.required]],
      description: ['', [Validators.maxLength(5000)]]
    });
  }

  saveStepGroupEnter(event): void {
    if (event.key === 'Enter') {
      this.saveStepGroup();
    }
  }

  onCommentChange(comment: RedLineComment): void {
    this.comment = comment;
  }

  saveStepGroup(): void {
    if (this.form.valid) {
      if (this.isRedlineAdd) {
        if (!_.isEmpty(this.comment.commentText)) {
          this.saving = true;
          this.addRedline();
        }
      } else {
        this.saving = true;
        this.addNonRedlineStepGroup();
      }
    }
  }

  addNonRedlineStepGroup(): void {
    let parentPk;
    if (this.parentStepGroup === null || this.parentStepGroup === undefined) {
      parentPk = null;
    } else {
      parentPk = {pk: this.parentStepGroup.pk};
    }

    const newGroup = new StepGroupDef();
    newGroup.stepGroupName = this.form.get('groupName').value;
    newGroup.displayOrder = this.form.get('displayOrder').value;
    newGroup.description = this.form.get('description').value;
    newGroup.editType = EditType.ORIGINAL;
    newGroup.stepGroupDefParent = parentPk;
    newGroup.procedureDetails = parentPk ? null : this.procedureData;

    let arrayToUpdate: StepGroupDef[];
    if (parentPk === null) {
      arrayToUpdate = this.procedureData.stepGroupDefs;
    } else {
      arrayToUpdate = this.parentStepGroup.stepGroupDefsChildren;
    }

    if (_.isEmpty(arrayToUpdate)) {
      // this is the first step group of array
      arrayToUpdate = [];
      arrayToUpdate.push(newGroup);
    } else {
      // there are existing groups in this array - splice the new group into the array
      arrayToUpdate.splice(newGroup.displayOrder - 1, 0, newGroup);
      arrayToUpdate = Utils.updateDisplayOrdersForArrayItems(arrayToUpdate, newGroup.displayOrder, arrayToUpdate.length - 1);
    }

    this.loggerService.info('Saving new step group in procedure with pk ' + this.procedureData.pk + ' and updating display ' +
      'orders for any following step groups; step group parent is ' + this.parentStepGroup);
    this.epicService.saveStepGroupData(_.slice(arrayToUpdate, newGroup.displayOrder - 1), this.procedureData.pk).subscribe((data) => {
      this.saving = false;
      if (!data.error) {
        // all the groups are updated and saved; insert arrayToUpdate back into procedureData
        this.handleResponseFromServer(data, arrayToUpdate);
        this.messageService.showSnackBar('Step groups saved', 'CLOSE');
      } else {
        this.loggerService.error('Could not save new step group and/or updates to following step groups: ' + data.error);
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

  private handleResponseFromServer(groupsFromServer: StepGroupDef[], arrayToUpdate: StepGroupDef[]): void {
    groupsFromServer.forEach(sg => {
      arrayToUpdate[sg.displayOrder - 1] = sg;
    });

    if (this.parentStepGroup) {
      this.parentStepGroup.stepGroupDefsChildren = arrayToUpdate;
      this.procedureData.stepGroupDefs = Utils.replaceStepGroupInProcedureDataWithChangedGroup(this.procedureData.stepGroupDefs, this.parentStepGroup);
    } else {
      this.procedureData.stepGroupDefs = arrayToUpdate;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  addRedline(): void {

    let arrayToUpdate: StepGroupDef[] = !this.parentStepGroup ? this.procedureData.stepGroupDefs : this.parentStepGroup.stepGroupDefsChildren;

    // create a step group object
    const redlinedStepGroup = new StepGroupDef();
    redlinedStepGroup.editType = EditType.REDLINE_ADD;
    redlinedStepGroup.displayOrder = this.form.get('displayOrder').value;
    redlinedStepGroup.stepGroupName = this.form.get('groupName').value;
    redlinedStepGroup.description = this.form.get('description').value;
    redlinedStepGroup.stepGroupDefParent = this.parentStepGroup;

    if (!this.parentStepGroup) {
      // this is a top level group
      redlinedStepGroup.procedureDetails = this.procedureData;
    }

    // create a red line object
    const redLineData = new RedLine();
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.redLineComment = this.comment;
    redLineData.stepGroupDef = redlinedStepGroup.asDTO();

    if (_.isEmpty(arrayToUpdate)) {
      // this is the first step group of array
      arrayToUpdate = [];
      arrayToUpdate.push(redlinedStepGroup);
    } else {
      // there are existing groups in this array - splice the new group into the array
      arrayToUpdate.splice(redlinedStepGroup.displayOrder - 1, 0, redlinedStepGroup);
      arrayToUpdate = Utils.updateDisplayOrdersForArrayItems(arrayToUpdate, redlinedStepGroup.displayOrder, arrayToUpdate.length - 1);
    }

    redLineData.stepGroupDefList = _.map(_.slice(arrayToUpdate, redlinedStepGroup.displayOrder), group => group.asDTO());

    // call the service to save the redline
    this.loggerService.info('Saving new step group as a red line in procedure with pk ' + this.procedureData.pk + ' and updating display ' +
      'orders for any following step groups; step group parent is ' + this.parentStepGroup);
    this.epicService.saveRedLineArrayToStepGroup([redLineData]).subscribe((data) => {
      this.saving = false;
      if (!data.error) {
        this.handleResponseFromServer(data, arrayToUpdate);
        this.procedureDataChange.emit(this.procedureData);
        this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
        this.messageService.showSnackBar('Red line saved', 'CLOSE');
      } else {
        this.loggerService.error('Error saving a step group as a red line, or updating following groups: ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving red line add/edits',
            errorMessage: data.error,
          }
        });
      }
      this.close();
    });
  }

  cancelRedline(): void {
    if (this.isRedlineAdd) {
      this.messageService.showSnackBar('Red line add cancelled by user', 'CLOSE');
    }
    this.close();
  }
}
