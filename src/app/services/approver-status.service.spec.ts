import { TestBed } from '@angular/core/testing';

import { ApproverStatusService } from './approver-status.service';

describe('ApproverStatusService', () => {
  let service: ApproverStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproverStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
