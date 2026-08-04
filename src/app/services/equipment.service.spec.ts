import { TestBed } from '@angular/core/testing';

import { EquipmentService } from './equipment.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from './local-storage.service.mock';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import {LoggerService} from '@app/services/logger.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EquipmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}));

  it('should be created', () => {
    const service: EquipmentService = TestBed.inject(EquipmentService);
    expect(service).toBeTruthy();
  });
});
