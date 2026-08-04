import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { ApproverActionComponent } from '../approver-action/approver-action.component';
import { ProcedureApprovalCommentComponent } from '../procedure-approval-comment/procedure-approval-comment.component';
import { ProcedureApprovalCommentDisplayComponent } from './procedure-approval-comment-display.component';


describe('ProcedureApprovalCommentDisplayComponent', () => {
  let component: ProcedureApprovalCommentDisplayComponent;
  let fixture: ComponentFixture<ProcedureApprovalCommentDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureApprovalCommentDisplayComponent,
        ProcedureApprovalCommentComponent,
        ApproverActionComponent,
        GenericCommentHistoryDisplayComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureApprovalCommentDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
