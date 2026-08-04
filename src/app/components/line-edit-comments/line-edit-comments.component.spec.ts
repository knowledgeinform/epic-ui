import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineEditCommentsComponent } from './line-edit-comments.component';
import { AppTestingModule } from '@app/app-testing-module';
import { commentDtoMock } from '@app/test/comment-dto.mock';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {GenericCommentHistoryDisplayComponent} from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { SignCommentComponent } from './sign-comment/sign-comment.component';

describe('LineEditCommentsComponent', () => {
  let component: LineEditCommentsComponent;
  let fixture: ComponentFixture<LineEditCommentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        LineEditCommentsComponent, GenericCommentHistoryDisplayComponent,
        SignCommentComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineEditCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create with mock data', () => {
    component.comment = commentDtoMock;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });
});
