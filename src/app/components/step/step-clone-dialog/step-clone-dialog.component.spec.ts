import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {StepCloneDialogComponent} from './step-clone-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProceduresearchComponent } from '@app/components/procedure/proceduresearch/proceduresearch.component';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('StepCloneDialogComponent', () => {
  let component: StepCloneDialogComponent;
  let fixture: ComponentFixture<StepCloneDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepCloneDialogComponent,
        ProceduresearchComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCloneDialogComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
