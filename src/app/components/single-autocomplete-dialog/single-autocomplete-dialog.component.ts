import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProcedureheaderComponent} from '../procedure/procedureheader/procedureheader.component';
import {Observable} from 'rxjs';
import {EPICWSService} from '@app/services/epic-ws.service';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors} from '@angular/forms';

export interface AutocompleteDialogBinder<T> {
  // TODO: isRequired:boolean
  title: string;
  instructions: string;
  placeholder: string;
  autocompleteSource: (searchTerm: string) => Observable<T[]>;
  autocompleteDisplay: (o: T) => string | undefined;

  /** Return null if the value is valid. If the value is invalid, return a string that describes the error. */
  validateSelection: (o: T) => string | null; // TODO: make this optional, and TODO: we potentially call this a lot, even for the same input; memoize if necessary
}

@Component({
  selector: 'app-single-autocomplete-dialog',
  templateUrl: './single-autocomplete-dialog.component.html',
  styleUrls: ['./single-autocomplete-dialog.component.css']
})
export class SingleAutocompleteDialogComponent implements OnInit {

  filteredUsers: Observable<any[]>;
  userControl: UntypedFormControl;
  userForm: UntypedFormGroup;
  validator: AutocompleteDialogBinder<any>;
  errorMessage: string;
  get isValidSelection() {
    // TODO: different logic if !validator.isRequired
    return typeof this.userControl.value === 'object' &&
      this.userControl.value !== null &&
      this.validator.validateSelection(this.userControl.value) === null;
  }

  constructor(public dialogRef: MatDialogRef<ProcedureheaderComponent>,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService) {
      this.validator = data.validator;
  }

  @HostListener('window:keyup.esc') onEscKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.userControl = new UntypedFormControl('', [
      this.inputValidator,
    ]);
    this.userForm = new UntypedFormGroup({
      user: this.userControl,
    }, [
      this.formValidator,
    ]);
    this.filteredUsers = this.userControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(v => typeof v === 'object' ? this.validator.autocompleteDisplay(v) : v),
      switchMap(v => this.validator.autocompleteSource(v)),
    );
  }

  formValidator = (control: UntypedFormGroup): ValidationErrors | null =>
    this.isValidSelection ? null : {invalidSelection: true};

  inputValidator = (control: AbstractControl): {[key: string]: any} | null => {
    const errorMessage = this.validator.validateSelection(control.value);
    this.errorMessage = errorMessage; // TODO: this smells like a code smell
    if (errorMessage) {
      return {'invalidSelection': errorMessage};
    } else {
      return null;
    }
  }
}
