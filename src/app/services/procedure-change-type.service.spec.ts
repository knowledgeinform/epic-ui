import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from './local-storage.service.mock';

import { ProcedureChangeTypeService } from './procedure-change-type.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ChangeTypeService', () => {
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
    const service: ProcedureChangeTypeService = TestBed.inject(ProcedureChangeTypeService);
    expect(service).toBeTruthy();
  });
});
