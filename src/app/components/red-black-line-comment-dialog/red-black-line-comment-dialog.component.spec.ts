import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppTestingModule } from '@app/app-testing-module';
import { CommentType } from '@app/interfaces/comment-type.dto';
import { commentDtoMock } from '@app/test/comment-dto.mock';
import { procedureDetailsDTOLockedRunMock } from '@app/test/procedure-details-dto.mock';
import { CommentChangeTypeSelectComponent } from '../comment-change-type-select/comment-change-type-select.component';
import { RedBlackLineCommentComponent } from '../red-black-line-comment/red-black-line-comment.component';
import { RedBlackLineCommentDialogComponent } from './red-black-line-comment-dialog.component';


describe('RedBlackLineCommentDialogComponent', () => {
  let component: RedBlackLineCommentDialogComponent;
  let fixture: ComponentFixture<RedBlackLineCommentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RedBlackLineCommentDialogComponent,
        RedBlackLineCommentComponent,

        CommentChangeTypeSelectComponent,
      ],
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: {
          commentType: CommentType.RED_LINE_COMMENT,
          procedureDetails: procedureDetailsDTOLockedRunMock,
        }
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedBlackLineCommentDialogComponent);
    component = fixture.componentInstance;
    component.comment = commentDtoMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
