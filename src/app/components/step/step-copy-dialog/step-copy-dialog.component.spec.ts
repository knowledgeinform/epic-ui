import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {StepCopyDialogComponent} from './step-copy-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { stepDefMock } from '@app/test/step-def.mock';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('StepCopyDialogComponent', () => {
  let component: StepCopyDialogComponent;
  let fixture: ComponentFixture<StepCopyDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepCopyDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCopyDialogComponent);
    component = fixture.componentInstance;
    component.step = stepDefMock;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
