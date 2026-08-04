import {TestBed} from '@angular/core/testing';

import {LoginService} from './login.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from './local-storage.service.mock';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoginService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  it('should be created', () => {
    const service: LoginService = TestBed.inject(LoginService);
    expect(service).toBeTruthy();
  });
});
