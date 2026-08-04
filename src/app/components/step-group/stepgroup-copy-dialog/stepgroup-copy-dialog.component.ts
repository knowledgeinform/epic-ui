import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {Utils} from '@app/utils';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {RedLine} from '@app/interfaces/red-line.dto';
import * as _ from 'lodash';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {RunValidationService} from '@app/services/run-validation.service';
import { StepGroupDef } from '@app/interfaces/step-group-def';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-stepgroup-copy-dialog',
  templateUrl: './stepgroup-copy-dialog.component.html',
  styleUrls: ['./stepgroup-copy-dialog.component.css']
})
export class StepgroupCopyDialogComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();
  @Input() stepGroup: StepGroupDef;
  @Input() disableForSaving = false;
  parentSelected: object;
  allOptions = [];
  isRedlineAdd: boolean = false;
  comment: RedLineComment = null;

  constructor(
    public dialogRef: MatDialogRef<StepgroupCopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    public epicService: EPICWSService,
    public messageService: MessageService,
    private dialog: MatDialog,
    private runValidationService: RunValidationService,
    private redLineReportingService: LineEditReportingService,
    private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.stepGroup = data.stepGroup;
    this.isRedlineAdd = data.redliningEnabled;
    if (this.isRedlineAdd) {
      this.comment = new RedLineComment({procedureDetails: this.procedureData.asDTO()});
    }
  }

  setSelection(value): void {
    this.parentSelected = value;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.allOptions = Utils.createGroupListingOptions(this.procedureData.stepGroupDefs, null, true, null, true);
  }

  copyGroup(): void {
    this.disableForSaving = true;
    if (this.isRedlineAdd) {
      this.saveRedLineCopy();
    } else {
      this.loggerService.info('Copying step group with pk ' + this.stepGroup.pk + ' to parent ' + this.parentSelected);
      this.epicService.copyGroupToGroup(this.stepGroup.pk, this.parentSelected['pk'], this.procedureData.pk).subscribe((data) => {
        this.disableForSaving = false;
        if (!data.error) {
          if (data.stepGroupDefParent != null) {
            // add to group
            const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, data.stepGroupDefParent.pk);
            if (foundGroup != null) {
              if (foundGroup.stepGroupDefsChildren === null || foundGroup.stepGroupDefsChildren === undefined) {
                foundGroup.stepGroupDefsChildren = [];
              }
              foundGroup.stepGroupDefsChildren.push(data);
            } else {
              this.loggerService.error('Copied step group, but cannot find its selected parent group in the UI');
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error copying step group',
                  errorMessage: 'ERROR: Unable to find parent step group to which to add copied step group'
                }
              });
            }
          } else {
            // add as root group
            if (this.procedureData.pk === data.procedureDetails.pk) {
              this.procedureData.stepGroupDefs.push(data);
            } else {
              this.loggerService.error('Copied step group, but could not add it as a top level group on the UI');
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error copying step group',
                  errorMessage: 'ERROR: Unable to add copied step group as root group'
                }
              });
            }
          }
          this.messageService.showSnackBar('Group Copied', 'CLOSE');
        } else {
          this.loggerService.error('Could not successfully copy group with pk ' + this.stepGroup.pk + ': ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error copying step group',
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
      this.messageService.showSnackBar('Red line edit cancelled by user', 'CLOSE');
    }
    this.close();
  }

  saveRedLineCopy(): void {
    // first check the comment is defined and not empty
    if (_.isEmpty(this.comment.commentText)) {
      this.messageService.showSnackBar('Enter a red line comment to copy this step.', 'CLOSE');
      return;
    }

    const redLineData = new RedLine();
    redLineData.redLineComment = this.comment;
    redLineData.procedureDetailsPk = this.procedureData.pk;
    redLineData.stepGroupDef = this.stepGroup.asDTO();

    this.loggerService.info('Copying as a red line the step group with pk ' + this.stepGroup.pk);
    this.epicService.saveCopiedStepGroupAsRedLine(redLineData, this.parentSelected['pk'])
      .subscribe((data) => {
        this.disableForSaving = false;
        if (!data.error) {
          if (data.stepGroupDefParent != null) {
            // add to group
            const foundGroup = Utils.findGroupByPk(this.procedureData.stepGroupDefs, data.stepGroupDefParent.pk);
            if (foundGroup != null) {
              if (foundGroup.stepGroupDefsChildren === null || foundGroup.stepGroupDefsChildren === undefined) {
                foundGroup.stepGroupDefsChildren = [];
              }
              foundGroup.stepGroupDefsChildren.push(data);
            } else {
              this.loggerService.error('Copied step group as a red line, but could not find the selected parent group on the UI');
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error copying step group',
                  errorMessage: 'ERROR: Unable to find parent step group to which to add the copied step group'
                }
              });
            }
          } else {
            // add as root group
            if (this.procedureData.pk === data.procedureDetails.pk) {
              this.procedureData.stepGroupDefs.push(data);
            } else {
              this.loggerService.error('Copied step group as a red line, but could not add it as a top-level group in the UI');
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error copying step group',
                  errorMessage: 'ERROR: Unable to add copied step group as root group'
                }
              });
            }
          }
          this.redLineReportingService.findGroupLineEditsForProcedure(this.procedureData);
          this.messageService.showSnackBar('Group Copied', 'CLOSE');
          this.procedureDataChange.emit(this.procedureData);
          this.runValidationService.validateProcedure(this.procedureData);
        } else {
          this.loggerService.error('Could not copy step group with pk ' + this.stepGroup.pk + ': ' + data.error);
          this.dialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error copying step group',
              errorMessage: data.error
            }
          });
        }
      });
    this.close();
  }
}
