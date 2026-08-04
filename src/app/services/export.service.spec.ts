import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {LoggerService} from '@app/services/logger.service';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ExportService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [
        { provide: LoggerService, useClass: LoggerServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}));

  it('should be created', () => {
    const service: ExportService = TestBed.inject(ExportService);
    expect(service).toBeTruthy();
  });
});
