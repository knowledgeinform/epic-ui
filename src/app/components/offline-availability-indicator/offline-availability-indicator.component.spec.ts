import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineAvailabilityIndicatorComponent } from './offline-availability-indicator.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('OfflineAvailabilityIndicatorComponent', () => {
  let component: OfflineAvailabilityIndicatorComponent;
  let fixture: ComponentFixture<OfflineAvailabilityIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ OfflineAvailabilityIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineAvailabilityIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
