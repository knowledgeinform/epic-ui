import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedBlackLineCommentComponent } from './red-black-line-comment.component';
import { AppTestingModule } from '@app/app-testing-module';
import { commentDtoMock } from '@app/test/comment-dto.mock';
import { CommentChangeTypeSelectComponent } from '../comment-change-type-select/comment-change-type-select.component';

describe('RedBlackLineCommentComponent', () => {
  let component: RedBlackLineCommentComponent;
  let fixture: ComponentFixture<RedBlackLineCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      declarations: [
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedBlackLineCommentComponent);
    component = fixture.componentInstance;
    component.comment = commentDtoMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
