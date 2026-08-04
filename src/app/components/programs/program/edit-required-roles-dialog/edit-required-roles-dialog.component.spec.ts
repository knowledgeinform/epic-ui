import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';

import { EditRequiredRolesDialogComponent } from './edit-required-roles-dialog.component';

describe('EditRequiredRolesDialogComponent', () => {
  let component: EditRequiredRolesDialogComponent;
  let fixture: ComponentFixture<EditRequiredRolesDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ EditRequiredRolesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRequiredRolesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
