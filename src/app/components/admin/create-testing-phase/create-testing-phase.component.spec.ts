import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTestingPhaseComponent } from './create-testing-phase.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('CreateTestingPhaseComponent', () => {
  let component: CreateTestingPhaseComponent;
  let fixture: ComponentFixture<CreateTestingPhaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTestingPhaseComponent ],
      imports: [
        AppTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTestingPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
