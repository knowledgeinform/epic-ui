import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {Utils} from '@app/utils';
import {StepType} from '@app/interfaces/step-type.dto';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-step-change-type-dialog',
  templateUrl: './step-change-type-dialog.component.html',
  styleUrls: ['./step-change-type-dialog.component.css']
})
export class StepChangeTypeDialogComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  @Input() step: StepDef;
  @Input() stepGroup: StepGroupDef;
  @Output() stepGroupChange = new EventEmitter<StepGroupDef>();
  typeSelected: StepType;
  @Output() procedureDataChange = new EventEmitter<ProcedureDetails>();
  @Input() disableForSaving = false;

  constructor(public dialogRef: MatDialogRef<StepChangeTypeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private dialog: MatDialog,
              private loggerService: LoggerService
  ) {
    this.procedureData = data.procedureData;
    this.step = data.step;
    this.stepGroup = data.stepGroup;

  }

  ngOnInit() {


  }

  setSelection(value): void {
    this.typeSelected = value;
  }

  get entryTypes() {
    return Utils.entryTypes.filter(type => type.value !== this.step.type);
  }

  close(): void {
    this.dialogRef.close();
  }

  changeStepType(): void {
    this.disableForSaving = true;
    this.loggerService.info('Changing the type for step with pk ' + this.step.pk);
    this.epicService.changeStepType(this.step.pk, this.typeSelected).subscribe((data) => {
      this.disableForSaving = false;
      if (!data.error) {
        // remove the old step, it was deleted
        const index = this.stepGroup.stepDefs.findIndex(step => step.pk === this.step.pk);
        this.stepGroup.stepDefs.splice(index, 1, data);
        this.stepGroupChange.emit(this.stepGroup);
        this.dialogRef.close();
      } else {
        this.loggerService.error('Could not change the type of the step with pk ' + this.step.pk + ': ' + data.error);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error changing step type!',
            errorMessage: data.error
          }
        });
      }
    });
  }
}
