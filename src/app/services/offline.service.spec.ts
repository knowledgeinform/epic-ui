import { TestBed } from '@angular/core/testing';

import { OfflineService } from './offline.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigServiceMock } from './app-config.service.mock';
import { AppConfigService } from './app-config-service.service';
import {LoggerService} from '@app/services/logger.service';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('OfflineService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}));

  it('should be created', () => {
    const service: OfflineService = TestBed.inject(OfflineService);
    expect(service).toBeTruthy();
  });
});
