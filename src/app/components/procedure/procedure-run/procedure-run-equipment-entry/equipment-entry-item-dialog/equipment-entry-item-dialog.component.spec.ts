import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTestingModule } from '@app/app-testing-module';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import {
  EquipmentEntryItemDialogComponent
} from '@app/components/procedure/procedure-run/procedure-run-equipment-entry/equipment-entry-item-dialog/equipment-entry-item-dialog.component';
import {
  CloneprocedureDialogComponent
} from "@app/components/procedure/cloneprocedure-dialog/cloneprocedure-dialog.component";

describe('EquipmentEntryItemDialogComponent', () => {
  let component: EquipmentEntryItemDialogComponent;
  let fixture: ComponentFixture<EquipmentEntryItemDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        CloneprocedureDialogComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentEntryItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
