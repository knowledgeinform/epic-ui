import { TestBed } from '@angular/core/testing';

import { ProcedureRevisionService } from './procedure-revision.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { LocalStorageService } from '@app/services/local-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProcedureRevisionService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatSnackBarModule,
        RouterTestingModule,
        AppTestingModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  it('should be created', () => {
    const service: ProcedureRevisionService = TestBed.inject(ProcedureRevisionService);
    expect(service).toBeTruthy();
  });
});
