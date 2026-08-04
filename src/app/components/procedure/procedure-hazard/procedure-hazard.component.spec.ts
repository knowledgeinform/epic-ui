import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureHazardComponent } from './procedure-hazard.component';
import { AppTestingModule } from '@app/app-testing-module';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

describe('ProcedureHazardComponent', () => {
  let component: ProcedureHazardComponent;
  let fixture: ComponentFixture<ProcedureHazardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureHazardComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureHazardComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
