import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { runMock } from '@app/test/run.mock';
import { RunCloseoutReviewingComponent } from './run-closeout-reviewing.component';


describe('RunCloseoutReviewingComponent', () => {
  let component: RunCloseoutReviewingComponent;
  let fixture: ComponentFixture<RunCloseoutReviewingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunCloseoutReviewingComponent,

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunCloseoutReviewingComponent);
    component = fixture.componentInstance;
    component.run = runMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
