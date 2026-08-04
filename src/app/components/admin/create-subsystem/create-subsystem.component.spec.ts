import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubsystemComponent } from './create-subsystem.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('CreateSubsystemComponent', () => {
  let component: CreateSubsystemComponent;
  let fixture: ComponentFixture<CreateSubsystemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSubsystemComponent ],
      imports: [ AppTestingModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSubsystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
