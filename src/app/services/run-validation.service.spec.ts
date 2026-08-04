import { TestBed } from '@angular/core/testing';

import { RunValidationService } from './run-validation.service';

describe('RunValidationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RunValidationService = TestBed.inject(RunValidationService);
    expect(service).toBeTruthy();
  });
});
