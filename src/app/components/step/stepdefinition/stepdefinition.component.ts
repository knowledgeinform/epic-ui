import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TablestepentryComponent} from '../tablestepentry/tablestepentry.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ActivatedRoute} from '@angular/router';
import {UploadFileComponentComponent} from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import * as _ from 'lodash';
import {Utils} from '@app/utils';
import { StepDef } from '@app/interfaces/step-def.interface';
import {AttachmentType} from '@app/interfaces/attachment-type.enum';

@Component({
  selector: 'app-stepdefinition',
  templateUrl: './stepdefinition.component.html',
  styleUrls: ['./stepdefinition.component.css']
})
export class StepdefinitionComponent implements OnInit {

  @Input() procedureData: any;
  @Input() stepGroup: StepGroupDef;
  @Input() step: StepDef;
  @Input() redliningEnabled: boolean = false;
  @Output() formChange = new EventEmitter();
  @Output() hideCancelChange = new EventEmitter();
  @Output() tableIsGone = new EventEmitter();
  @Input() disableForSaving = false;
  @Input() isEdit: boolean;
  @ViewChild(TablestepentryComponent, {}) tableStepEntry: TablestepentryComponent;
  @ViewChild(UploadFileComponentComponent, /* TODO: add static flag */ {}) stepDefAttachmentEntry: UploadFileComponentComponent;
  public AttachmentType = AttachmentType;

  // form fields here should match the field names in the step interface
  form: UntypedFormGroup;


  disableType = false;

  public maxDisplayOrder: number;

  constructor(private formBuilder: UntypedFormBuilder,
              private epicService: EPICWSService,
              private route: ActivatedRoute,
              private messageService: MessageService) {
  }

  ngOnInit() {

    // Set max display order based on whether there are other steps, and whether this is a newly-added step.
    this.maxDisplayOrder = _.isEmpty(this.stepGroup.stepDefs) ? 1 :
      this.step ? this.stepGroup.stepDefs.length : this.stepGroup.stepDefs.length + 1;

    let maxLength = Utils.getMaxRichTextEditorLength();
    this.form = this.formBuilder.group({
      stepName: ['', [Validators.maxLength(100)]],
      requireWitness: [false],
      esd0: [false],
      hazardous: [false],
      mandatoryInspection: [false],
      instructions: ['', [Validators.maxLength(maxLength), Validators.required]],
      type: [{value: '', disabled: this.isEdit || this.disableForSaving}, Validators.required],
      displayOrder: ['', [
        Validators.min(1),
        Validators.max(this.maxDisplayOrder),
        Validators.required
      ]],
      allowEquipmentEntry: [false],
    });

    if (this.step === null || this.step === undefined) {
      // not an already existing step
      let value = 1;
      if (this.stepGroup.stepDefs !== null && this.stepGroup.stepDefs !== undefined) {
        value = this.stepGroup.stepDefs.length + 1;
      }
      this.form.controls['displayOrder'].setValue(value);

      // set default to checkbox
      const toSelect = this.entryTypes.find(t => t.value === 'CHECKBOX');
      this.form.controls['type'].setValue(toSelect.value);

    } else {
      // if here, this is an existing step that's being edited.
      // set the form controls to the values from the step
      this.form.controls['stepName'].setValue(this.step.stepName);
      this.form.controls['requireWitness'].setValue(this.step.requireWitness);
      this.form.controls['mandatoryInspection'].setValue(this.step.mandatoryInspection);
      this.form.controls['esd0'].setValue(this.step.esd0);
      this.form.controls['hazardous'].setValue(this.step.hazardous);
      this.form.controls['instructions'].setValue(this.step.instructions);
      this.form.controls['displayOrder'].setValue(this.step.displayOrder);
      this.form.controls['type'].setValue(this.step.type);
      this.form.controls['type'].disable();
      this.form.controls.allowEquipmentEntry.setValue(this.step.allowEquipmentEntry);
      this.form.controls.displayOrder.markAsTouched();
      this.form.controls.displayOrder.updateValueAndValidity();
      this.onSubmit();
    }
  }

  get entryTypes() {
    return Utils.entryTypes;
  }

  // when all fields have entries, emit the form data.
  // TODO: Possibly put a timeout or debounce on this so that it doesn't emit with every keyup
  onSubmit() {
    if (this.form.valid) {
      this.formChange.emit(this.form);
    } else {
      this.formChange.emit(null);
    }
  }

  hideCancelDueToAttachmentsChange(event): void {
    this.messageService.showSnackBar('You have changed the attachments for this step; you must save your changes', 'CLOSE');
    this.hideCancelChange.emit(true);
  }

  //Set text from summernote editor component
  receiveTextChange(event): void {
    if(event){
      this.form.get('instructions').setValue(event);
      this.onSubmit();
    }
  }
  receiveTableIsGone(event):void {
    this.tableIsGone.emit(event);
  } 
}
