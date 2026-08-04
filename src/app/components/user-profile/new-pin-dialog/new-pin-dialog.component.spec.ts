import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPinDialogComponent } from './new-pin-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import {procedureDetailsLockedRunMock} from '@app/test/procedure-details.mock';
import {usersMock} from '@app/test/users.mock';

describe('NewPinDialogComponent', () => {
  let component: NewPinDialogComponent;
  let fixture: ComponentFixture<NewPinDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ NewPinDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPinDialogComponent);
    component = fixture.componentInstance;
    component.user = usersMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
