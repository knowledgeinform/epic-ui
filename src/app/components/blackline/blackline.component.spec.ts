import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacklineComponent } from './blackline.component';
import { AppTestingModule } from '@app/app-testing-module';
import { LineEditCommentsComponent } from '../line-edit-comments/line-edit-comments.component';
import {GenericCommentHistoryDisplayComponent} from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { SignCommentComponent } from '../line-edit-comments/sign-comment/sign-comment.component';
import { CommentChangeTypeSelectComponent } from '../comment-change-type-select/comment-change-type-select.component';

describe('BlacklineComponent', () => {
  let component: BlacklineComponent;
  let fixture: ComponentFixture<BlacklineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        BlacklineComponent,
        LineEditCommentsComponent,
        SignCommentComponent,
        CommentChangeTypeSelectComponent,
        GenericCommentHistoryDisplayComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlacklineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
