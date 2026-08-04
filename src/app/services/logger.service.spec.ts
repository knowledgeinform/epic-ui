import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {AppConfigService} from '@app/services/app-config-service.service';
import {AppConfigServiceMock} from '@app/services/app-config.service.mock';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import {JL} from 'jsnlog';
import {LocalStorageService} from '@app/services/local-storage.service';
import {LocalStorageServiceMock} from '@app/services/local-storage.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: 'JSNLog', useValue: JL },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}));

  it('should be created', () => {
    const service: LoggerService = TestBed.inject(LoggerService);
    expect(service).toBeTruthy();
  });
});
