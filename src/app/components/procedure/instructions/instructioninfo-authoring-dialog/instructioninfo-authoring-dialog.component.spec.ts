import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {InstructioninfoAuthoringDialogComponent} from './instructioninfo-authoring-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('InstructioninfoAuthoringDialogComponent', () => {
  let component: InstructioninfoAuthoringDialogComponent;
  let fixture: ComponentFixture<InstructioninfoAuthoringDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        InstructioninfoAuthoringDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructioninfoAuthoringDialogComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
