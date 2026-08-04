import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { LineEditCommentsComponent } from '@app/components/line-edit-comments/line-edit-comments.component';
import { SignCommentComponent } from '@app/components/line-edit-comments/sign-comment/sign-comment.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { runMock } from '@app/test/run.mock';
import { validationErrorsMock } from '@app/test/validation-errors.mock';
import { RunSummaryComponent } from './run-summary.component';


describe('RunSummaryComponent', () => {
  let component: RunSummaryComponent;
  let fixture: ComponentFixture<RunSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunSummaryComponent,
        LineEditCommentsComponent,
        SignCommentComponent,
        GenericCommentHistoryDisplayComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunSummaryComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    component.procedureData = procedureDetailsLockedRunMock;
    component.validationErrors = validationErrorsMock;
    component.nonconformances = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
