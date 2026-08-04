import {inject, TestBed} from '@angular/core/testing';

import {AuthGuard} from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AppTestingModule } from './app-testing-module';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppTestingModule,
      ],
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
