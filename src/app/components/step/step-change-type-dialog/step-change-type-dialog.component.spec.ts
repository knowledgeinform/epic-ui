import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {StepChangeTypeDialogComponent} from './step-change-type-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { stepDefMock } from '@app/test/step-def.mock';

describe('StepChangeTypeDialogComponent', () => {
  let component: StepChangeTypeDialogComponent;
  let fixture: ComponentFixture<StepChangeTypeDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [StepChangeTypeDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepChangeTypeDialogComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    component.step = stepDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
