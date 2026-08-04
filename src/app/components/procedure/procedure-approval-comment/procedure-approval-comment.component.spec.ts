import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedureApprovalCommentComponent} from './procedure-approval-comment.component';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';

describe('ProcedureApprovalCommentComponent', () => {
  let component: ProcedureApprovalCommentComponent;
  let fixture: ComponentFixture<ProcedureApprovalCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedureApprovalCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureApprovalCommentComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
