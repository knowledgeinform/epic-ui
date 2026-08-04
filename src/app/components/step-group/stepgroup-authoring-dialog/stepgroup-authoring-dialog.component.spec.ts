import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepgroupAuthoringDialogComponent } from './stepgroup-authoring-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { procedureDetailsDTOLockedRunMock } from '@app/test/procedure-details-dto.mock';
import { RedLineComment } from '@app/interfaces/comment.dto';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

describe('StepgroupAuthoringDialogComponent', () => {
  let component: StepgroupAuthoringDialogComponent;
  let fixture: ComponentFixture<StepgroupAuthoringDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepgroupAuthoringDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepgroupAuthoringDialogComponent);
    component = fixture.componentInstance;
    component.procedureData = new ProcedureDetails().loadFromDTO(procedureDetailsDTOLockedRunMock);
    component.comment = new RedLineComment({procedureDetails: component.procedureData.asDTO()});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
