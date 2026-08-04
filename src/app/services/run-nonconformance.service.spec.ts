import { TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';

import { RunNonconformanceService } from './run-nonconformance.service';

describe('RunNonconformanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      AppTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: RunNonconformanceService = TestBed.inject(RunNonconformanceService);
    expect(service).toBeTruthy();
  });
});
