import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingEquipmentListComponent } from './reporting-equipment-list.component';
import { AppTestingModule } from '@app/app-testing-module';
import { AgGridModule } from 'ag-grid-angular';
import { ReportingRunStatusComponent } from '../reporting-run-status/reporting-run-status.component';

describe('ReportingEquipmentListComponent', () => {
  let component: ReportingEquipmentListComponent;
  let fixture: ComponentFixture<ReportingEquipmentListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [
        ReportingEquipmentListComponent,
        ReportingRunStatusComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingEquipmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
