import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingProcedureStatusComponent } from './reporting-procedure-status.component';
import { AppTestingModule } from '@app/app-testing-module';
import { AgGridModule } from 'ag-grid-angular';
import { ReportingRunStatusComponent } from '../reporting-run-status/reporting-run-status.component';

describe('ReportingProcedureStatusComponent', () => {
  let component: ReportingProcedureStatusComponent;
  let fixture: ComponentFixture<ReportingProcedureStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [
        ReportingProcedureStatusComponent,
        ReportingRunStatusComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingProcedureStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
