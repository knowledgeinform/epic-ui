import { TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';

import { ProgramService } from './program.service';

describe('ProgramService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      AppTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: ProgramService = TestBed.inject(ProgramService);
    expect(service).toBeTruthy();
  });
});
