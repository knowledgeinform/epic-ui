import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {StepEditingDialogComponent} from '../../step/step-editing-dialog/step-editing-dialog.component';
import {StepMovingDialogComponent} from '../../step/step-moving-dialog/step-moving-dialog.component';
import {StepDeletingDialogComponent} from '../../step/step-deleting-dialog/step-deleting-dialog.component';
import {StepType} from '@app/interfaces/step-type.dto';
import * as _ from 'lodash';
import {MessageService} from '@app/services/message.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ManualStepValidationDialogComponent} from '../../manual-step-validation-dialog/manual-step-validation-dialog.component';
import {Equipment} from '@app/interfaces/equipment';
import {OfflineService} from '@app/services/offline.service';
import {LoginService} from '@app/services/login.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {StepCopyDialogComponent} from '@app/components/step/step-copy-dialog/step-copy-dialog.component';
import {EditType} from '@app/interfaces/edit-type.dto';
import {Utils} from '@app/utils';
import {RunValidationService} from '@app/services/run-validation.service';
import {StepDisplayNamePipe} from '@app/pipes/step-display-name.pipe';
import {StepChangeTypeDialogComponent} from '@app/components/step/step-change-type-dialog/step-change-type-dialog.component';
import {Run} from '@app/interfaces/Run';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {StepDef} from '@app/interfaces/step-def.interface';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {RunStepSecondSignature, SecondSignatureType} from '@app/interfaces/second-signature.dto';
import {AttachmentType} from '@app/interfaces/attachment-type.enum';
import {ProcedureStatus} from "@app/interfaces/procedure-status.dto";
import { LineEditService } from '@app/services/line-edit.service';
import { RunDataEntryService } from '@app/services/run-data-entry.service';

@Component({
  selector: 'app-proceduresteps',
  templateUrl: './proceduresteps.component.html',
  styleUrls: ['./proceduresteps.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate(500, style({opacity: 1}))
      ]),
      transition(':leave', [
        animate(500, style({opacity: 0}))
      ])
    ]),
    trigger('displayActions', [
      state('display', style({
        opacity: 1,
        height: '100%'
      })),
      state('hide', style({
        opacity: 0,
        height: '0px'
      })),
      transition('hide => display', [
        animate(500)
      ]),
      transition('display => hide', [
        animate(500)
      ])
    ])
  ],
})
export class ProcedurestepsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() blackliningEnabled: boolean = false;
  readOnly: boolean = true;
  @Input() set isReadonly(value: boolean) {
    this.readOnly = value;
  }
  @Input() step: StepDef;
  @Output() stepChange = new EventEmitter();
  @Input() stepGroup: StepGroupDef;
  @Input() procedureData: ProcedureDetails;
  @Input() expandAll: boolean;
  @Input() expandThis: boolean;
  @Input() public run: Run = null;  // Will be null if this is not a run.
  @Input() public isVisible = true;
  public keyUp = new Subject();
  public anchorName: string;
  stepMenuDisplay = false;
  public StepType = StepType;
  public EditType = EditType;
  public displayValComment: boolean = false;
  public displayBlacklineComment: boolean = false;
  public displayRedlineComment: boolean = false;
  public displayStepHistory: boolean = false;
  public displayRunCloseoutStickyComments: boolean = false;
  public buttonGroupClick: boolean = false;
  private subscriptions: Subscription[] = [];
  public savingSecondSignature: boolean = false;
  public displayWitnessEntry: boolean = true;
  public displayInspectionEntry: boolean = true;
  public displayActions: boolean = false;
  public RunStatus = RunStatus;
  public AttachmentType = AttachmentType;

  public formGroup: UntypedFormGroup;

  public witnessSignature = new UntypedFormControl('', [Validators.required, Validators.maxLength(14)]);
  public inspectionSignature = new UntypedFormControl('', [Validators.required, Validators.maxLength(14)]);
  public SecondSignatureType = SecondSignatureType;

  public isValid: boolean = false;
  // enable/disable editing functions of steps
  public editable: boolean = false;

  // variables to store line heights for expansion headers
  public singleLineHeight: string = '';
  public multiLineHeight: string = '100px';
  public smallScreen: boolean;
  screenWidth: any;

  constructor(public dialog: MatDialog,
              public epicService: EPICWSService,
              private fb: UntypedFormBuilder,
              public messageService: MessageService,
              public offlineService: OfflineService,
              public jwtService: LoginService,
              public runValidationService: RunValidationService,
              public lineEditReportingService: LineEditReportingService,
              private loggerService: LoggerService,
              public lineEditService: LineEditService,
              public runDataEntryService: RunDataEntryService) {
    this.getScreenWidth();
    this.smallScreen = this.screenWidth <= 599;
    this.subscriptions.push(runDataEntryService.runStepChanged.subscribe(changedRunStep => {
      if (changedRunStep.pk === this.step.pk) {
        this.step = changedRunStep;
        this.validateProcedure();
      }
    }));

  }

  ngOnInit() {

    // FIXME: Can this anchorName/id be something like "step_pk_*" instead?
    this.anchorName = 'p' + this.step.pk + '_' + new StepDisplayNamePipe().transform(this.step).split(' ').join('_').split('.').join('_');

    this.formGroup = this.fb.group({
      [StepType.CHECKBOX]: '',
      [StepType.SINGLE_VALUE]: '',
      [StepType.TABLE]: {},
    });

    // Make formGroup readonly when offline
    const offlineSub = this.offlineService.offlineSubject.subscribe( isOffline => {
      isOffline ? this.formGroup.disable() : this.formGroup.enable();
    });

    this.subscriptions.push(offlineSub);

    if (this.expandThis === null || this.expandThis === undefined) {
      this.expandThis = false;
    }

    if (this.step.witnessSecondSignature) {
      this.displayWitnessEntry = false;
    }

    if (this.step.mandatoryInspectionSecondSignature) {
      this.displayInspectionEntry = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.step) {
      this.validateStep();
      this.displayWitnessEntry = _.isNil(this.step.witnessSecondSignature);
      this.displayInspectionEntry = _.isNil(this.step.mandatoryInspectionSecondSignature);
    }
    if (changes.isReadonly || changes.redliningEnabled || changes.step) {
      this.setEditable();
    }
  }

  // Gets the width of the screen
  @HostListener('window:resize', ['$event']) getScreenWidth(event?) {
    this.screenWidth = window.innerWidth;
  }

  private setEditable(): void {
    const canRedline = this.procedureData.redliningEnabled;
    const isEditableRun = !this.readOnly && !!this.run;
    const isEditableProcedure = !this.readOnly && this.procedureData.status === ProcedureStatus.DRAFT;
    const isNotDeleted = this.step.editType !== EditType.REDLINE_DELETE;
    this.editable = (canRedline || isEditableRun || isEditableProcedure) && isNotDeleted;
  }

  onTableChange(step: StepDef): void {
    this.validateProcedure();
  }



  toggleExpandThis(thisInput): void {
    if (thisInput.detail.secondaryTarget === this.step.pk) {
      if (this.stepGroup !== null && this.stepGroup !== undefined) {
        const parentElem = document.getElementById('p' + this.stepGroup.pk + '_' +
          this.stepGroup.stepGroupName.split(' ').join('_').split('.').join('_'));
        const data = {
          'input': thisInput.detail.input, 'primaryTarget': thisInput.detail.primaryTarget,
          'secondaryTarget': this.stepGroup.pk
        };
        const clickEvent = new CustomEvent('click', { detail: data });
        parentElem.dispatchEvent(clickEvent);
      }
      this.expandThis = thisInput.detail.input;
    }
    if (thisInput.detail.primaryTarget === this.step.pk) {
      this.expandThis = thisInput.detail.input;
    }
  }

  toggleDisplayActions(): void {
    this.displayActions = !this.displayActions;
  }

  openEditStepDialog(): void {
    this.dialog.open(StepEditingDialogComponent, {
      width: '95vw',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: this.step,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  openMoveStepDialog(): void {
    this.dialog.open(StepMovingDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: this.step,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  openChangeStepTypeDialog(): void {
    this.dialog.open(StepChangeTypeDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: this.step,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
    // TODO: Put in function here to open the step editing dialog if this is now a table step, per EPIC-528.
  }

  openCopyStepDialog(): void {
    this.dialog.open(StepCopyDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: this.step,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  openDeleteStepDialog(): void {
    this.dialog.open(StepDeletingDialogComponent, {
      width: '550px',
      minHeight: '200px',
      disableClose: true,
      data: {
        procedureData: this.procedureData,
        stepGroup: this.stepGroup,
        step: this.step,
        redliningEnabled: this.procedureData.redliningEnabled
      }
    });
  }

  public onInputValChange(): void {
    this.loggerService.info('Saving value for step with pk ' + this.step.pk + '; value=' + this.step.runValue);
    this.runDataEntryService.saveRunStepValue(this.step).subscribe((data) => {
      if (data.errorMessage) {
        this.loggerService.error('Error while saving run value for step with pk ' + this.step.pk + ': ' + data.errorMessage);
        this.messageService.showSnackBar('Unable to save run value for step with name ' + this.step.stepName + ' caused by error: ' + data.errorMessage, 'CLOSE', 10000)
      } else {
        // Update step values without breaking pointers.
        _.assign(this.step, data);
        this.runDataEntryService.announceRunStepDefChange(this.step);
        this.messageService.showSnackBar('Run Value Saved', 'CLOSE');

        this.validateProcedure();
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions.
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  submitManualValidation() {
    this.displayValidationOverrideDialog(true);
  }

  removeManualValidation() {
    this.displayValidationOverrideDialog(false);
  }

  private displayValidationOverrideDialog(manualValidation: boolean): void {
    const dialogRef = this.dialog.open(ManualStepValidationDialogComponent, {
      width: '550px',
      minHeight: '220px',
      disableClose: true,
      data: {
        target: [this.step],
        procedureData: this.procedureData
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // set manualValidation flag on step
      if (result !== null && result !== '') {
        this.lineEditService.announceBlackLineChanges(result);

        // show message
        if (manualValidation) {
          this.messageService.showSnackBar('Step Manually Marked As Done', 'CLOSE');
        } else {
          this.messageService.showSnackBar('Step Manual Completion Removed', 'CLOSE');
        }
      }

      this.validateProcedure();
      this.lineEditReportingService.findAllLineEdits(this.procedureData);
    });
  }

  public submitSecondSignature(signature: UntypedFormControl, signatureType: SecondSignatureType): void {
    if (signature.valid) {
      // create the signature data object
      const signatureData = {} as RunStepSecondSignature;
      signatureData.stepDef = this.step.asDTO();
      signatureData.type = signatureType;
      signatureData.user = this.lineEditService.parseSignatureStringForUserNameAndPin(signature.value);
      if (_.isNil(signatureData.user)) {
        this.lineEditService.displaySignatureParseErrorMessage(signature.value); 
        this.savingSecondSignature = false;
        return;
      }

      this.savingSecondSignature = true;
      this.loggerService.info('Saving ' + signatureType + ' for step with pk ' + this.step.pk, signatureData);
      this.epicService.saveSecondSignature(signatureData).then((data) => {
        if (!data.hasOwnProperty('error')) {
          _.assign(this.step, data);
          if (signatureType === SecondSignatureType.WITNESS) {
            this.displayWitnessEntry = false;
          } else if (signatureType === SecondSignatureType.MANDATORY_INSPECTION) {
            this.displayInspectionEntry = false;
          }
          this.messageService.showSnackBar('Signature saved', 'CLOSE');
        } else {
          this.loggerService.error('Could not save ' + signatureType + ' signature for user ' + signatureData.user.userId);
          this.messageService.showSnackBar('Could not save the signature: ' + data['error'], 'CLOSE', 5000);
          if (signatureType === SecondSignatureType.WITNESS) {
            this.witnessSignature.reset();
          } else if (signatureType === SecondSignatureType.MANDATORY_INSPECTION) {
            this.inspectionSignature.reset();
          }
        }
        this.savingSecondSignature = false;
        this.stepChange.emit(this.step);
        this.validateProcedure();
      });
    }
  }

  public signWitnessAgain(): void {
    this.witnessSignature.reset();
    this.displayWitnessEntry = true;
    this.messageService.showSnackBar('Current witness signature will be retained until new signature is saved.', 'CLOSE');
  }

  public signInspectionAgain(): void {
    this.inspectionSignature.reset();
    this.displayInspectionEntry = true;
    this.messageService.showSnackBar('Current mandatory inspection signature will be retained until new signature is saved.', 'CLOSE');
  }

  public cancelWitnessAgain(): void {
    this.displayWitnessEntry = false;
  }
  public cancelInspectionAgain(): void {
    this.displayInspectionEntry = false;
  }

  // Returns whether or not the screen is small (less than 600 pixels)
  public isSmallScreen() : boolean {
    return this.screenWidth <= 599;
  }

  public determineExpansionHeaderHeight() : string {
    if (this.isExpansionHeaderMultiLines()) {
      return this.multiLineHeight;
    } else {
      return this.singleLineHeight;
    }
  }

  // Step Expansion headers should be multiple lines if there are icons present and the screen size is extra small
  private isExpansionHeaderMultiLines() : boolean {
    const hasCommentSymbol = this.step.runStepComments?.length > 0 || this.step.blackLineComments?.length > 0 || this.step.redLineComments?.length > 0 || this.step.runCloseoutStickyComments?.length > 0;
    const hasOtherSymbol = this.isValid || this.step.allowEquipmentEntry || this.step.requireWitness || this.step.hazardous || this.step.mandatoryInspection || this.step.isManualValidation;
    return (hasCommentSymbol || hasOtherSymbol) && this.isSmallScreen();
  }

  private validateProcedure() {
    if (this.run === null) return;
    this.runValidationService.validateProcedure(this.procedureData);
    this.validateStep();
  }

  private validateStep() {
    if (this.run === null) return;
    const stepValidation = this.runValidationService.validateStep(this.procedureData.pk, this.step);
    this.isValid = stepValidation === null;
  }

  public onEquipmentChange() {
    this.addNewEquipmentToRun();
  }

  public onEquipmentRemove(step: StepDef) {
    _.assign(this.step, step);
  }

  /**
   * Populates the Run equipment list with any items from the Step that are missing on the Run.
   */
  private addNewEquipmentToRun() {
    const added: Equipment[] = _.differenceBy(this.step.equipment, this.run.equipmentList, e => e.pk);
    if (added) {
      this.run.equipmentList = this.run.equipmentList.concat(added);  // NB: Changing array pointer required for equipment list to detect change and re-render list of items.
    }
  }

}
