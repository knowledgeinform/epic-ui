import { TestBed } from '@angular/core/testing';

import { RunDataEntryService } from './run-data-entry.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RunDataEntryService', () => {
  let service: RunDataEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AppTestingModule,
        AppMaterialModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(RunDataEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
