import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureStepGroupPrintableComponent } from './procedure-step-group-printable.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProcedureStepPrintableComponent } from '../procedure-step-printable/procedure-step-printable.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { ProcedureRunPrintEquipmentTableComponent } from '../procedure-run/procedure-run-print/procedure-run-print-equipment-table/procedure-run-print-equipment-table.component';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';

describe('ProcedureStepGroupPrintableComponent', () => {
  let component: ProcedureStepGroupPrintableComponent;
  let fixture: ComponentFixture<ProcedureStepGroupPrintableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureStepGroupPrintableComponent,
        ProcedureStepPrintableComponent,
        ProcedureStepPrintableComponent,
        ImageDisplayComponentComponent,
        ProcedureRunPrintEquipmentTableComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureStepGroupPrintableComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct step numbering at top level', () => {
    component.stepGroup.displayOrder = 1;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('1');
    component.stepGroup.displayOrder = 2;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('2');
  });

  it('should display correct step numbering while nested', () => {

    component.parentDisplayNumber = '1';
    component.stepGroup.displayOrder = 1;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('1.1');
    component.parentDisplayNumber = '2';
    updateDisplayNumber();
    expect(component.displayNumber).toBe('2.1');

    component.parentDisplayNumber = '1';
    component.stepGroup.displayOrder = 2;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('1.2');
    component.parentDisplayNumber = '2';
    updateDisplayNumber();
    expect(component.displayNumber).toBe('2.2');

  });

  function updateDisplayNumber() {
    component['updateDisplayNumber']();
  }

});
