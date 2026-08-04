import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { stepDefMock } from '@app/test/step-def.mock';
import { CommentChangeTypeSelectComponent } from '../comment-change-type-select/comment-change-type-select.component';
import { RedBlackLineCommentComponent } from '../red-black-line-comment/red-black-line-comment.component';
import { ManualStepValidationDialogComponent } from './manual-step-validation-dialog.component';


describe('ManualStepValidationDialogComponent', () => {
  let component: ManualStepValidationDialogComponent;
  let fixture: ComponentFixture<ManualStepValidationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ManualStepValidationDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualStepValidationDialogComponent);
    component = fixture.componentInstance;
    component.target = [stepDefMock];
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
