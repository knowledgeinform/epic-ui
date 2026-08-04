import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {StepgroupCopyDialogComponent} from './stepgroup-copy-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('StepgroupCopyDialogComponent', () => {
  let component: StepgroupCopyDialogComponent;
  let fixture: ComponentFixture<StepgroupCopyDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepgroupCopyDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepgroupCopyDialogComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
