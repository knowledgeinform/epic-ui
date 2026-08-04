import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunApproverCommentComponent } from './run-approver-comment.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('RunApproverCommentComponent', () => {
  let component: RunApproverCommentComponent;
  let fixture: ComponentFixture<RunApproverCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ RunApproverCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunApproverCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
