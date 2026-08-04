import {Component, Input} from '@angular/core';
import {FormArrayTyped} from '@app/interfaces/angular-form-typed.class';
import {FormItem} from '../procedure-run-equipment-entry.component';
import {IsBeforeTodayPipe} from '@app/pipes/is-before-today.pipe';

@Component({
  selector: 'app-equipment-entry-item',
  host: { class: 'flex-row' },
  templateUrl: './equipment-entry-item.component.html',
  styleUrls: ['./equipment-entry-item.component.css']
})
export class EquipmentEntryItemComponent {

  @Input() readOnly: boolean = false;
  @Input() i: number = null;
  @Input() parentForm: FormArrayTyped<FormItem>;


  constructor() { }



  get isOverdue() {
    return new IsBeforeTodayPipe().transform(this.parentForm.get('calibrationDueDate').value);
  }

}
