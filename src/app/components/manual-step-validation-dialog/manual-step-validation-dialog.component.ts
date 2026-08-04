import {Component, EventEmitter, HostListener, Inject, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessageService} from '@app/services/message.service';
import {BlackLineDto, BlackLineEntityType} from '@app/interfaces/black-line.dto';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import { StepDef } from '@app/interfaces/step-def.interface';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import * as _ from 'lodash';
import { LineEditStateService } from '@app/services/line-edit-state.service';

@Component({
  selector: 'app-manual-step-validation-dialog',
  templateUrl: './manual-step-validation-dialog.component.html',
  styleUrls: ['./manual-step-validation-dialog.component.css']
})
export class ManualStepValidationDialogComponent implements OnInit {

  target: StepDef[]; // should be a StepDef array
  procedureData: ProcedureDetails;
  @Output() stepChange = new EventEmitter();
  manualValidationForm: UntypedFormGroup;
  fetchIsDone: boolean = true;
  blackLine: BlackLineDto;
  constructor(
    public epicService: EPICWSService,
    private fb: UntypedFormBuilder,
    public messageService: MessageService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ManualStepValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      target: StepDef[],
      procedureData: ProcedureDetails;
    },
    private loggerService: LoggerService,
    private lineEditStateService: LineEditStateService
  ) {
    this.target = data.target;
    this.procedureData = data.procedureData;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.blackLine = new BlackLineDto({procedureDetails: this.procedureData.asDTO()});
    this.blackLine.commentText += this.target.length > 1?'bulk MV: ':'';
    this.manualValidationForm = this.fb.group({
      manualValidation: [false, Validators.requiredTrue]
    });
  }

  submitManualValidation() {
    if (this.manualValidationForm.valid) {
      this.saveBlackLine(true);
    }
  }

  submitRemoval() {
    if (this.manualValidationForm.valid) {
      this.saveBlackLine(false);
    }
  }
  isManualValidation(){
     if ( this.target.length === 1) {
         return this.target[0].isManualValidation;
     } else {
        return false;
     }
  }
  needsManualValidation() {
    if (this.target.length > 1) {
      return true;  /** dialog must be launched for bulk validation**/
    }
    else if (this.target.length === 1) {
      return this.target[0].isManualValidation === null || this.target[0].isManualValidation === undefined || !this.target[0].isManualValidation;
    }
    else {
      this.loggerService.info('Unexpected target object', this.target);
    }
  }

  private saveBlackLine(manualValidation: boolean): void {
    // call the service to save
    this.fetchIsDone = false;
    const entityType = BlackLineEntityType.STEP;

    // create the array of blacklines.
    const blackLineArray = [] as BlackLineDto[];
    const stepArray = [] as StepDef[];
    stepArray.push(...this.target);
    stepArray.forEach(step => {
      const blackLineForEach = _.cloneDeep(this.blackLine);
      blackLineForEach.stepDef = step.asDTO();
      blackLineArray.push(blackLineForEach);
    });

    this.epicService.saveNewBlackLines(blackLineArray, entityType, manualValidation).subscribe((data) => {
      if (data.errorMessage) {
        this.loggerService.error('Cannot save the manual validation action: ' + data.errorMessage);
        this.messageService.showSnackBar('Error in saving manual validation(s) to the server: ' + data.errorMessage, 'CLOSE')
      }
      else {
        this.dialogRef.close(this.lineEditStateService.enrichSavedBlackLines(data, blackLineArray));
      }
    });
  }
}
