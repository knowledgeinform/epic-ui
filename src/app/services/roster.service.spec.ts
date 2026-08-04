import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';

import { RosterService } from './roster.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RosterService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppTestingModule,
        AppMaterialModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  it('should be created', () => {
    const service: RosterService = TestBed.inject(RosterService);
    expect(service).toBeTruthy();
  });
});
