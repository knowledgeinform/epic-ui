import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { runMock } from '@app/test/run.mock';
import { RunCloseoutCompletedComponent } from './run-closeout-completed.component';


describe('RunCloseoutCompletedComponent', () => {
  let component: RunCloseoutCompletedComponent;
  let fixture: ComponentFixture<RunCloseoutCompletedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunCloseoutCompletedComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutCompletedComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
