import { TestBed } from '@angular/core/testing';

import { AppUpdateService } from './app-update.service';
import { SwUpdate } from '@angular/service-worker';
import { SwUpdateServiceMock } from './sw-update.service.mock';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AppUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      MatSnackBarModule,
    ],
    providers: [
      { provide: SwUpdate, useClass: SwUpdateServiceMock },
    ]
  }));

  it('should be created', () => {
    const service: AppUpdateService = TestBed.inject(AppUpdateService);
    expect(service).toBeTruthy();
  });
});
