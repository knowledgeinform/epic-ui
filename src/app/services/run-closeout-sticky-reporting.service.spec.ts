import { TestBed } from '@angular/core/testing';

import { RunCloseoutStickyReportingService } from './run-closeout-sticky-reporting.service';

describe('RunCloseoutStickyReportingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RunCloseoutStickyReportingService = TestBed.inject(RunCloseoutStickyReportingService);
    expect(service).toBeTruthy();
  });
});
