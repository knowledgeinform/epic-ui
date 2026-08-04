import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { RunCloseoutStickyCommentComponent } from '../run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunCloseoutStickyCommentSummaryComponent } from './run-closeout-sticky-comment-summary.component';


describe('RunCloseoutStickyCommentSummaryComponent', () => {
  let component: RunCloseoutStickyCommentSummaryComponent;
  let fixture: ComponentFixture<RunCloseoutStickyCommentSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunCloseoutStickyCommentSummaryComponent,
        RunCloseoutStickyCommentComponent,
        GenericCommentHistoryDisplayComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutStickyCommentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
