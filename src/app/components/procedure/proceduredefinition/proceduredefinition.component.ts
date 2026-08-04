import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {EPICWSService} from '../../../services/epic-ws.service';
import {Observable} from 'rxjs';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-proceduredefinition',
  templateUrl: './proceduredefinition.component.html',
  styleUrls: ['./proceduredefinition.component.css']
})
export class ProceduredefinitionComponent implements OnInit {
  selectionLoadComplete = false;
  @Input() error;
  data;
  @Output() procedureDef: EventEmitter<any> = new EventEmitter();
  form;

  validHazardDescription: ValidatorFn = (control: UntypedFormGroup): ValidationErrors | null => {
    const isHazardous = control.get('hazardous').value;
    const hazardDescription = control.get('hazardDescription').value;
    const isInvalid = isHazardous && hazardDescription.length === 0;
    return  isInvalid ? { 'invalidDescription': true} : null;
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    public epicService: EPICWSService,
    private loggerService: LoggerService
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.maxLength(255), Validators.required]],
      description: ['', [Validators.maxLength(255), Validators.required]],
      program: ['', Validators.required],
      subsystem: ['', Validators.required],
      esd0: [false],
      hazardous: [false],
      hazardDescription: ['', [Validators.maxLength(2048)]]
    }, {validators: this.validHazardDescription});
  }

  // populate the program and subsystem dropdowns upon initiation
  ngOnInit() {
    this.data = new Observable();
    this.epicService.getCreateProcedureSelections().subscribe((data) => {
      this.selectionLoadComplete = true;
      if (data.error) {
        this.error = data.error;
        this.loggerService.error('Could not retrieve program/subsystem/testing phase options for procedure definition; ' + data.error);
      }
      this.data = data;
    });
  }

  // when all fields have entries, emit the form data.
  onSubmit() {
    if (!this.form.get('hazardous').value) {
      this.form.get('hazardDescription').reset('');
      this.form.get('hazardDescription').setErrors(null);
    }
    if (this.form.valid) {
      this.procedureDef.emit(this.form);
    }
  }
}
