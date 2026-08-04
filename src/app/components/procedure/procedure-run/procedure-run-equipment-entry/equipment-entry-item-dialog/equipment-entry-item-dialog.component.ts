import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormArrayTyped} from "@app/interfaces/angular-form-typed.class";
import {
  FormItem
} from "@app/components/procedure/procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component";
import {Equipment} from "@app/interfaces/equipment";

@Component({
  selector: 'app-equipment-entry-item-dialog',
  templateUrl: './equipment-entry-item-dialog.component.html',
  styleUrls: ['./equipment-entry-item-dialog.component.css']
})
export class EquipmentEntryItemDialogComponent {
  protected equipment: Equipment;
  protected i: number = null;
  protected parentForm: FormArrayTyped<FormItem>;

  constructor(
    public dialogRef: MatDialogRef<EquipmentEntryItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.equipment = data.equipment;
    this.i = data.i;
    this.parentForm = data.parentForm;
  }
}
