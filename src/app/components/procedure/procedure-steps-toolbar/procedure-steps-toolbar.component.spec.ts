import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {AppTestingModule} from "@app/app-testing-module";
import {StepgroupAuthoringDialogComponent} from "@app/components/step-group/stepgroup-authoring-dialog/stepgroup-authoring-dialog.component";
import {StepCloneDialogComponent} from "@app/components/step/step-clone-dialog/step-clone-dialog.component";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";

import { ProcedureStepsToolbarComponent } from './procedure-steps-toolbar.component';

describe('ProcedureStepsToolbarComponent', () => {
  let component: ProcedureStepsToolbarComponent;
  let fixture: ComponentFixture<ProcedureStepsToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureStepsToolbarComponent,
        StepgroupAuthoringDialogComponent,
        StepCloneDialogComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureStepsToolbarComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
