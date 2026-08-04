import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';

import { BulkValidateDialogComponent } from './bulk-validate-dialog.component';

describe('BulkValidateDialogComponent', () => {
  let component: BulkValidateDialogComponent;
  let fixture: ComponentFixture<BulkValidateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AppMaterialModule
      ],
      declarations: [ BulkValidateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkValidateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
