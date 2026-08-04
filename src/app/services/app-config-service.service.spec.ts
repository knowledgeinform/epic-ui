import {TestBed} from '@angular/core/testing';

import {AppConfigService} from './app-config-service.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}));

  it('should be created', () => {
    const service: AppConfigService = TestBed.inject(AppConfigService);
    expect(service).toBeTruthy();
  });
});
