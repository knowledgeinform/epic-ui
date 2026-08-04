import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { StatusHistoryComponent } from '@app/components/procedure/status-history/status-history.component';
import { runMock } from '@app/test/run.mock';
import { RunCloseoutCompletedComponent } from '../run-closeout-completed/run-closeout-completed.component';
import { RunCloseoutReviewingComponent } from '../run-closeout-reviewing/run-closeout-reviewing.component';
import { RunCloseoutSubmissionComponent } from '../run-closeout-submission/run-closeout-submission.component';
import { RunCloseoutContainerComponent } from './run-closeout-container.component';


describe('RunCloseoutContainerComponent', () => {
  let component: RunCloseoutContainerComponent;
  let fixture: ComponentFixture<RunCloseoutContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunCloseoutContainerComponent,
        RunCloseoutSubmissionComponent,
        RunCloseoutReviewingComponent,
        RunCloseoutCompletedComponent,
        StatusHistoryComponent,
        GenericCommentHistoryDisplayComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutContainerComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
