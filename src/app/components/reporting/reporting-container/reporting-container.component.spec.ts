import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingContainerComponent } from './reporting-container.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ReportingProcedureStatusComponent } from '../reporting-procedure-status/reporting-procedure-status.component';
import { ReportingRunStatusComponent } from '../reporting-run-status/reporting-run-status.component';
import { ReportingEquipmentListComponent } from '../reporting-equipment-list/reporting-equipment-list.component';
import { AgGridModule } from 'ag-grid-angular';

describe('ReportingContainerComponent', () => {
  let component: ReportingContainerComponent;
  let fixture: ComponentFixture<ReportingContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [
        ReportingContainerComponent,
        ReportingProcedureStatusComponent,
        ReportingRunStatusComponent,
        ReportingEquipmentListComponent,
        ReportingRunStatusComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
