import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NonConformance} from '@app/interfaces/non-conformance';
import {Run} from '@app/interfaces/Run';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {StepValidation} from '@app/interfaces/step-validation';
import * as _ from 'lodash';
import { ValidationErrors } from '@app/interfaces/validation-errors';
import { CommentType } from '@app/interfaces/comment-type.dto';
import {LineEditBulkSignDialogComponent} from '@app/components/line-edit-bulk-sign-dialog/line-edit-bulk-sign-dialog.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import { StepType } from '@app/interfaces/step-type.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {BulkSignDialogComponent} from "@app/components/bulk-sign-dialog/bulk-sign-dialog.component";

@Component({
  selector: 'app-run-summary',
  templateUrl: './run-summary.component.html',
  styleUrls: ['./run-summary.component.css']
})
export class RunSummaryComponent implements OnInit, OnChanges {

  @Input() run: Run;
  @Input() validationErrors: any;
  @Input() nonconformances: NonConformance[];
  @Input() isReadonly: boolean;
  public runStatus = RunStatus;
  procedureData: ProcedureDetails;
  invalidSteps: StepValidation[];
  expandValidationAll: boolean = false;
  expandNonconformanceAll: boolean = false;
  expandRedLinesAll: boolean = false;
  expandBlackLinesAll: boolean = false;
  public ValidationErrors = ValidationErrors;
  public CommentType = CommentType;
  public StepType = StepType;

  constructor(public epicService: EPICWSService,
              public messageService: MessageService,
              public dialog: MatDialog,
              public lineEditReportingService: LineEditReportingService) { }

  ngOnInit() {
    this.procedureData = this.run.procedureDetails;
    if (this.validationErrors) {
      this.invalidSteps = this.getAllInvalidSteps(this.validationErrors.children);
    }
    if (this.run.runApprovals === null || this.run.runApprovals === undefined) {
      this.run.runApprovals = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'validationErrors': {
            if (this.validationErrors) {
              this.invalidSteps = this.getAllInvalidSteps(this.validationErrors.children);
            }
            return;
          }
          case 'run': {
            this.procedureData = this.run.procedureDetails;
            return;
          }
        }
      }
    }
  }

  private getAllInvalidSteps(array: any[]): StepValidation[] {
    if (_.isEmpty(array)) {
      return [];
    }
    const method = this;
    const stepArray = [];
    _.forEach(array, function(sg) {
      if (!_.isEmpty(sg.childSteps)) {
        _.forEach(sg.childSteps, function(step) {
          step.element = _.clone(step.element);
          step.element.stepGroupDef = _.clone(sg.element);
          stepArray.push(step);
        });
      }
      if (!_.isEmpty(sg.childGroups)) {
        _.forEach(sg.childGroups, function(child) {
          child.element = _.clone(child.element);
          child.element.stepGroupDefParent = _.clone(sg.element);
        });
        const stepsFromChildren = method.getAllInvalidSteps(sg.childGroups);
        if (!_.isEmpty(stepsFromChildren)) {
          stepsFromChildren.forEach(function(step) {
            stepArray.push(step);
          });
        }
      }
    });
    return stepArray;
  }
  openBulkSignLineDialog(redLine: boolean) {
    this.dialog.open(BulkSignDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        redBlackLineComments: true,
        redLines: redLine,
      }
    });
    this.lineEditReportingService.findAllLineEdits(this.procedureData);
  }
}
