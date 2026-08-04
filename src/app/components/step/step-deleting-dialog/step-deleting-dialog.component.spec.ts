import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { stepDefMock } from '@app/test/step-def.mock';
import { StepDeletingDialogComponent } from './step-deleting-dialog.component';


describe('StepDeletingDialogComponent', () => {
  let component: StepDeletingDialogComponent;
  let fixture: ComponentFixture<StepDeletingDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepDeletingDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepDeletingDialogComponent);
    component = fixture.componentInstance;
    component.step = stepDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
