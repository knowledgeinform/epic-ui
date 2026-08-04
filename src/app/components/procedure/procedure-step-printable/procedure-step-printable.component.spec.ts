import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureStepPrintableComponent } from './procedure-step-printable.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { ProcedureRunPrintEquipmentTableComponent } from '../procedure-run/procedure-run-print/procedure-run-print-equipment-table/procedure-run-print-equipment-table.component';
import { stepDefMock } from '@app/test/step-def.mock';

describe('ProcedureStepPrintableComponent', () => {
  let component: ProcedureStepPrintableComponent;
  let fixture: ComponentFixture<ProcedureStepPrintableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureStepPrintableComponent,
        ImageDisplayComponentComponent,
        ProcedureRunPrintEquipmentTableComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureStepPrintableComponent);
    component = fixture.componentInstance;
    component.step = stepDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct step numbering at top level', () => {
    stepDefMock.displayOrder = 1;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('1');
    stepDefMock.displayOrder = 2;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('2');
  });

  it('should display correct step numbering while nested', () => {

    component.parentDisplayNumber = '1';
    component.step.displayOrder = 1;
    updateDisplayNumber();
    expect(component.displayNumber).toBe('1.1');
    component.parentDisplayNumber = '2';
    updateDisplayNumber();
    expect(component.displayNumber).toBe('2.1');

    component.parentDisplayNumber = '1';
    component.step.displayOrder = 2;
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
