import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunCloseoutStickyCommentComponent } from './run-closeout-sticky-comment.component';
import { AppTestingModule } from '@app/app-testing-module';
import { runMock } from '@app/test/run.mock';
import { StepType } from '@app/interfaces/step-type.dto';
import { EditType } from '@app/interfaces/edit-type.dto';
import { StepDef } from '@app/interfaces/step-def.interface';
import {GenericCommentHistoryDisplayComponent} from '@app/components/generic-comment-history-display/generic-comment-history-display.component';

describe('RunCloseoutStickyCommentComponent', () => {
  let component: RunCloseoutStickyCommentComponent;
  let fixture: ComponentFixture<RunCloseoutStickyCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ RunCloseoutStickyCommentComponent,
        GenericCommentHistoryDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutStickyCommentComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    component.step = new StepDef().loadFromDTO({
      pk: 0,
      displayOrder: 1,
      esd0: false,
      hazardous: false,
      instructions: 'mockInstructions',
      mandatoryInspection: false,
      requireWitness: false,
      stepName: 'mockStepName',
      type: StepType.CHECKBOX,
      runStepAttachments: [],
      editType: EditType.ORIGINAL,
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
