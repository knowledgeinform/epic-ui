import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import * as _ from 'lodash';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {EquipmentService} from '@app/services/equipment.service';
import {Subscription} from 'rxjs';
import {Equipment} from '@app/interfaces/equipment';
import {OfflineService} from '@app/services/offline.service';
import {Moment} from 'moment';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogModel
} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Run} from '@app/interfaces/Run';
import {StepDef} from '@app/interfaces/step-def.interface';
import {
  EquipmentEntryItemDialogComponent
} from "@app/components/procedure/procedure-run/procedure-run-equipment-entry/equipment-entry-item-dialog/equipment-entry-item-dialog.component";
import {FormArrayTyped} from "@app/interfaces/angular-form-typed.class";

@Component({
  selector: 'app-procedure-run-equipment-entry',
  host: { class: 'flex-row' },
  templateUrl: './procedure-run-equipment-entry.component.html',
  styleUrls: ['./procedure-run-equipment-entry.component.scss']
})
export class ProcedureRunEquipmentEntryComponent implements OnInit, OnDestroy, OnChanges, AfterContentChecked {

  private _equipment: Equipment[] = null;
  public runEquipment: Equipment[];
  public fa: UntypedFormArray = null;

  @Input() public run: Run;
  @Input() public step?: StepDef = null;
  @Input() public readOnly: boolean = false;
  @Input() public allowItemEdit: boolean = true;
  @Input() public allowAddExistingItem: boolean = false;

  @Input() public set equipment(equipment: Equipment[]) {
    this._equipment = equipment;
    this.equipmentChange.emit(this._equipment);
  }
  @Output() equipmentChange = new EventEmitter<Equipment[]>();
  public get equipment() {
    return this._equipment;
  }
  @Output() equipmentDelete = new EventEmitter<Run>();
  @Output() equipmentRemoveFromStep = new EventEmitter<StepDef>();
  private formUpdateDelay: number = 2000;
  private subscriptions: { [key: string]: Subscription } = {};
  public addItemForm: UntypedFormGroup = null;
  public showAddExistingInput: boolean = false;
  public addEquipmentFilterText: string = null;
  public addEquipmentFilteredEquipment: Equipment[] = this._equipment;

  protected showSpinner = false;

  constructor(
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private equipmentService: EquipmentService,
    public offlineService: OfflineService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    this.generateFormArray();

    // Disable/enable form array based on status.
    this.subscriptions.offlineState = this.offlineService.offlineSubject.subscribe( offline => this.updateReadOnly() );

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.readOnly) this.updateReadOnly();
    if (changes.equipment) {
      // Regenerate form array if it is not synced with equipment.
      if (!this.fa) return;
      const faEquipment: FormItem[] = this.removeBlankItems(_.chain(this.fa.controls).map(c => c.value).compact().value());
      const unrenderedEquipment: Equipment[] = _.differenceBy(this.equipment, faEquipment, e => e.pk);
      const deletedEquipment: FormItem[] = _.differenceBy(faEquipment, this.equipment, e => e.pk);
      if (unrenderedEquipment.length || deletedEquipment.length)
        this.generateFormArray();
    }
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => {
      sub.unsubscribe();
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges(); // Fix bug about ExpressionChangedAfterItHasBeenChecked error. More info: https://github.com/angular/angular/issues/23657#issuecomment-526913914
  }

  /**
   * Enables or disables the form fields depending on the `readOnly` attribute and whether the client is offline.
   */
  private updateReadOnly() {
    if (this.fa !== null && this.fa !== undefined) {
      this.offlineService.offline || this.readOnly ? this.fa.disable() : this.fa.enable();
    }
  }

  private addBlankItem() {
    if (this.allowItemEdit)
      this.addEquipmentToForm(null);
  }

  private addEquipmentToForm(e: Equipment) {
    const formItem = FormItem.fromEquipment(e);
    const fg = this.fb.group(formItem);
    this.fa.push(fg);
  }

  private isBlankItem(e: FormItem) {
    return (!e || (e.name === '' && e.serialNumber === ''));
  }

  private removeBlankItems(equipment: FormItem[]) {
    return _.filter(equipment, e => {
      return !this.isBlankItem(e);
    });
  }

  private clearFormControlValidation(control: AbstractControl): void {
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }

  public showAddItemForm() {
    this.addItemForm = this.fb.group(FormItem.fromEquipment(null));
  }

  public onAddItemSubmit() {

    this.equipmentService.updateItem(this.run.pk, this.addItemForm.value as Equipment, this.step ? this.step.pk : null).then((serverEquipment) => {

      if (this.step) {
        const stepFromServer = serverEquipment.steps.filter(step => step.pk = this.step.pk)[0];
        _.merge(this.step, stepFromServer);
      }
      _.merge(this.run, serverEquipment.run);
      const se = FormItem.fromEquipment(serverEquipment);

      // Update equipment value in array
      this.addEquipmentToForm(se.toEquipment());

      // Clear & hide input form.
      this.addItemForm = null;
    });

  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private updateEquipmentOnServer = _.debounce(() => {

    _.forEach(this.fa.controls, control => {
      if (control.dirty && control.valid) {
        this.showSpinner = true;
        this.equipmentService.updateItem(this.run.pk, control.value as Equipment, this.step ? this.step.pk : null).then((serverEquipment) => {

          if (this.step) {
            const stepFromServer = serverEquipment.steps.filter(step => step.pk = this.step.pk)[0];
            _.merge(this.step, stepFromServer);
          }
          _.merge(this.run, serverEquipment.run);
          this.clearFormControlValidation(control);

          const se = FormItem.fromEquipment(serverEquipment);
          control.setValue(se);  // Update equipment value in form

          // Update equipment value in array
          const index = this.equipment.findIndex(eq => eq.pk === se.pk);
          if (index === -1) {
            this.equipment.push(serverEquipment);
          } else {
            this.equipment[index] = serverEquipment;
          }
          this.showSpinner = false;
        });
      }
    });

  }, this.formUpdateDelay);

  /**
   * Deletes the item from the server and fires `equipmentDelete` event.
   */
  public deleteItemFromRun(item: Equipment): void {
    const dialogData = new ConfirmationDialogModel('Delete Equipment Item', 'Are you sure you want to delete this item? ' +
      'If this item was used on a step, it will be deleted from the step as well.');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.showSpinner = true;
        this.equipmentService.deleteItem(item.pk).then(run => {
          this.generateFormArray();
          this.equipmentDelete.emit(run);
          this.showSpinner = false;
        });
      }
    });
  }

  /**
   * Removes the item from its step.
   */
  public removeItemFromStep(item: Equipment): void {
    this.equipmentService.removeItemFromStep(item.pk, this.step.pk).then(step => this.removeItemFromList(step) );
  }

  private removeItemFromList(step: StepDef) {
    this.equipment = step.equipment;
    this.generateFormArray();
    this.equipmentRemoveFromStep.emit(step);
  }

  public onDeleteClick(item: Equipment) {
    if (this.step !== null) this.removeItemFromStep(item);
    else this.deleteItemFromRun(item);
  }

  /**
   * Creates a form array from `this.equipment`.
   */
  private generateFormArray(): void {
    // FIXME: Commenting out editing from the list itself until the performance issue is fixed. Using dialog window instead.
    this.fa = this.fb.array([]);
    const sortedEquipment = _.sortBy(this._equipment, e => e.pk);
    _.forEach(sortedEquipment, e => this.addEquipmentToForm(e));
    // this.addBlankItem();

    if (this.subscriptions.formValueChanges) this.subscriptions.formValueChanges.unsubscribe();
    this.subscriptions.formValueChanges = this.fa.valueChanges.subscribe(equipment => {

      // Update equipment var to match form's list.
      this.equipment = _.map(this.removeBlankItems(equipment), item => {
        return new FormItem(item).toEquipment();
      });

      // Update equipment on server
      // if (this.fa.dirty) this.updateEquipmentOnServer();

      // Automatically add input row to table when it's full.
      // if (this.fa.valid && !this.isBlankItem(_.last(equipment))) this.addBlankItem();

    });
  }

  public addExistingInputClose() {
    this.showAddExistingInput = false;
    this.addEquipmentFilterText = '';
  }

  public addExistingInputSubmit(event: MatAutocompleteSelectedEvent) {
    this.addEquipmentFilterText = '';
    const equipment: Equipment = event.option.value;
    this.equipmentService.updateItem(this.run.pk, equipment, this.step ? this.step.pk : null).then( res => {
      if (this.step) {
        const stepFromServer = res.steps.filter(step => step.pk === this.step.pk)[0];
        _.merge(this.step, stepFromServer);
      }
      this.addEquipmentToForm(res);
    });
  }

  public addExistingInputShow() {
    this.showAddExistingInput = true;
    this.equipmentService.getEquipmentForRun(this.run.pk).then(equipment => {
      this.runEquipment = equipment;
    });
  }

  public filterAddEquipmentList() {

    // Value may be an object if set via auto-complete.
    if ( typeof this.addEquipmentFilterText !== 'string') return;

    const runItemsDeduped = _.differenceBy(this.runEquipment, this.equipment, e => e.pk);

    if (_.isEmpty(this.addEquipmentFilterText)) {
      this.addEquipmentFilteredEquipment = runItemsDeduped;
      return;
    }

    this.addEquipmentFilteredEquipment = _.filter(runItemsDeduped, equipment => {
      const equipStr = JSON.stringify(equipment).toLowerCase();
      return _.includes(equipStr, this.addEquipmentFilterText.toLowerCase());
    });

  }

  public autocompleteDisplayWith(equipment: Equipment) {
    return equipment ? equipment.name : null;
  }
  public addNewEquipmentEntryItemDialog() {
    this.addBlankItem();
    const idx = this.fa.controls.length - 1;
    this.openEquipmentEntryItemDialog(this.fa.controls[idx], idx, true);
  }

  public openEquipmentEntryItemDialog(parentForm: AbstractControl<FormItem>, i: number, isBlank?: boolean): void {
    this.dialog.open(EquipmentEntryItemDialogComponent, {
      data: {
        i,
        parentForm
      },
      disableClose: true
    }).afterClosed().subscribe((result: FormArrayTyped<FormItem>) => {
      if(!_.isEmpty(result)) {
        this.showSpinner = true;
        this.fa.controls[i].setValue(result.value);
        this.updateEquipmentOnServer();
      } else {
        if(isBlank) {
          this.fa.removeAt(i);
        }
      }
    });
  }

}

export class FormItem {
  pk: number = null;
  name: string = '';
  serialNumber: string = '';
  propertyNumber: string = '';
  calibrationDate: Moment = null;
  calibrationDueDate: Moment = null;
  run: Run = null;

  constructor(fi?: FormItem) {
    if (fi) _.assign(this, fi);
  }

  public static fromEquipment(e: Equipment): FormItem {
    const fi = new FormItem();
    const props = _.pick(e, Object.getOwnPropertyNames(fi));
    _.assign(fi, props);
    return fi;
  }

  public toEquipment() {
    const eq: Equipment = _.assign(new Equipment(), this);
    return eq;
  }
}
