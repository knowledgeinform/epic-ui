import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepgroupDeleteDialogComponent } from './stepgroup-delete-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('StepgroupDeleteDialogComponent', () => {
  let component: StepgroupDeleteDialogComponent;
  let fixture: ComponentFixture<StepgroupDeleteDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepgroupDeleteDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepgroupDeleteDialogComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
