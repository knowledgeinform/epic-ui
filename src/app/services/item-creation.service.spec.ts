import { TestBed } from '@angular/core/testing';

import { ItemCreationService } from './item-creation.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from './local-storage.service.mock';
import {LoggerService} from '@app/services/logger.service';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ItemCreationService', () => {
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
    const service: ItemCreationService = TestBed.inject(ItemCreationService);
    expect(service).toBeTruthy();
  });
});
