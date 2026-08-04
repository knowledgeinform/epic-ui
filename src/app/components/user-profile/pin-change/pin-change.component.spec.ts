import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinChangeComponent } from './pin-change.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('PinChangeComponent', () => {
  let component: PinChangeComponent;
  let fixture: ComponentFixture<PinChangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ PinChangeComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
