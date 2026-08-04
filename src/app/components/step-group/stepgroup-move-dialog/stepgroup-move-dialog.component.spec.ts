import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepgroupMoveDialogComponent } from './stepgroup-move-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { MovedefinitionComponent } from '@app/components/movedefinition/movedefinition.component';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('StepgroupMoveDialogComponent', () => {
  let component: StepgroupMoveDialogComponent;
  let fixture: ComponentFixture<StepgroupMoveDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AppMaterialModule,
      ],
      declarations: [
        StepgroupMoveDialogComponent,
        MovedefinitionComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepgroupMoveDialogComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    component.stepGroup.stepGroupDefParent = null;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
