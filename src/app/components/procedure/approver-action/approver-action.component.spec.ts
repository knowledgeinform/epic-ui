import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { procedureReviewerMock } from '@app/test/procedure-approval.mock';
import { ApproverActionComponent } from './approver-action.component';
import { ProcedureApproval } from '@app/interfaces/procedure-approval.dto';
import * as _ from 'lodash';


describe('ApproverActionComponent', () => {
  let component: ApproverActionComponent;
  let fixture: ComponentFixture<ApproverActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ApproverActionComponent,
        IconEsd0Component,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproverActionComponent);
    component = fixture.componentInstance;
    component.approval = _.assign(new ProcedureApproval(), procedureReviewerMock);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
