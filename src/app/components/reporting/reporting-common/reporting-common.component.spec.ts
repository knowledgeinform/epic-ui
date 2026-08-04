import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingCommonComponent } from './reporting-common.component';
import { AppTestingModule } from '@app/app-testing-module';
import { AgGridModule } from 'ag-grid-angular';
import { ReportingRunStatusComponent } from '../reporting-run-status/reporting-run-status.component';

describe('ReportingCommonComponent', () => {
  let component: ReportingCommonComponent;
  let fixture: ComponentFixture<ReportingCommonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [
        ReportingCommonComponent,
        ReportingRunStatusComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
