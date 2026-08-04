import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineEditBulkSignDialogComponent } from './line-edit-bulk-sign-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('LineEditBulkSignDialogComponent', () => {
  let component: LineEditBulkSignDialogComponent;
  let fixture: ComponentFixture<LineEditBulkSignDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ LineEditBulkSignDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineEditBulkSignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
