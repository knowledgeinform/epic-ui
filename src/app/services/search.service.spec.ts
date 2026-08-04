import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { LocalStorageService } from '@app/services/local-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {JL} from "jsnlog";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MatSnackBarModule,
        RouterTestingModule, MatDialogModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: 'JSNLog', useValue: JL },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {
                close: () => { },
            } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
