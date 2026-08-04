import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { runMock } from '@app/test/run.mock';
import { RunCloseoutSubmissionComponent } from './run-closeout-submission.component';


describe('RunCloseoutSubmissionComponent', () => {
  let component: RunCloseoutSubmissionComponent;
  let fixture: ComponentFixture<RunCloseoutSubmissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunCloseoutSubmissionComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutSubmissionComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
