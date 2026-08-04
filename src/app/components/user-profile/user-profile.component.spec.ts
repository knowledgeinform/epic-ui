import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import { AppTestingModule } from '@app/app-testing-module';
import { PinChangeComponent } from './pin-change/pin-change.component';
import { SwUpdateServiceMock } from '@app/services/sw-update.service.mock';
import { SwUpdate } from '@angular/service-worker';
import { AppComponent } from '../app/app.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      providers: [
        AppComponent,
        { provide: SwUpdate, useClass: SwUpdateServiceMock },
      ],
      declarations: [
        UserProfileComponent,
        PinChangeComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
