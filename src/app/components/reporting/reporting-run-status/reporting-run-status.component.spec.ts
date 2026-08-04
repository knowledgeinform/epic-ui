import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingRunStatusComponent } from './reporting-run-status.component';
import { AppTestingModule } from '@app/app-testing-module';
import { AgGridModule } from 'ag-grid-angular';

describe('ReportingRunStatusComponent', () => {
  let component: ReportingRunStatusComponent;
  let fixture: ComponentFixture<ReportingRunStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [ ReportingRunStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingRunStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
