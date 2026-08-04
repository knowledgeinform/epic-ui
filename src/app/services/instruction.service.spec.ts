import { TestBed } from '@angular/core/testing';

import { InstructionService } from './instruction.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {LocalStorageService} from '@app/services/local-storage.service';
import {LocalStorageServiceMock} from '@app/services/local-storage.service.mock';
import {LoggerService} from '@app/services/logger.service';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InstructionService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  it('should be created', () => {
    const service: InstructionService = TestBed.inject(InstructionService);
    expect(service).toBeTruthy();
  });
});
