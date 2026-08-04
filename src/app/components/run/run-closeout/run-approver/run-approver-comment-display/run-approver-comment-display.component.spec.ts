import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { ApproverActionComponent } from '@app/components/procedure/approver-action/approver-action.component';
import { RunApproverCommentComponent } from '../run-approver-comment/run-approver-comment.component';
import { RunApproverCommentDisplayComponent } from './run-approver-comment-display.component';


describe('RunApproverCommentDisplayComponent', () => {
  let component: RunApproverCommentDisplayComponent;
  let fixture: ComponentFixture<RunApproverCommentDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunApproverCommentDisplayComponent,
        RunApproverCommentComponent,
        GenericCommentHistoryDisplayComponent,
        ApproverActionComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunApproverCommentDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
