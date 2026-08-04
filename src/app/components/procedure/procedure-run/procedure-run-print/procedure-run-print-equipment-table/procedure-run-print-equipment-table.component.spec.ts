import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureRunPrintEquipmentTableComponent } from './procedure-run-print-equipment-table.component';

describe('ProcedureRunPrintEquipmentTableComponent', () => {
  let component: ProcedureRunPrintEquipmentTableComponent;
  let fixture: ComponentFixture<ProcedureRunPrintEquipmentTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcedureRunPrintEquipmentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureRunPrintEquipmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
