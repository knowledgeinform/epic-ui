import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
import {
  LOCAL_STORAGE_CONFIG,
  LocalStorageType
} from './local-storage.config';

describe('LocalStorageService', () => {
  function runStorageTests(
    storageType: LocalStorageType,
  ): void {

    let storage, otherStorage;
    if (storageType == "localStorage") {
      storage = localStorage;
      otherStorage = sessionStorage;
    } else {
      storage = sessionStorage;
      otherStorage = localStorage;
    }

    describe(`using ${storageType}`, () => {
      let service: LocalStorageService;
      const prefix = 'test_prefix';

      beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();

        TestBed.configureTestingModule({
          providers: [
            LocalStorageService,
            {
              provide: LOCAL_STORAGE_CONFIG,
              useValue: {
                prefix,
                storageType,
              },
            },
          ],
        });

        service = TestBed.inject(LocalStorageService);
      });

      afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      it('should be created', () => {
        expect(service).toBeTruthy();
      });

      it(`should store values in ${storageType} using the configured prefix`, () => {
        service.set('settings', { compact: true });

        expect(storage.getItem('test_prefix.settings')).toBe(
          JSON.stringify({ compact: true }),
        );

        expect(otherStorage.getItem('test_prefix.settings')).toBeNull();
      });

      it('should retrieve stored JSON values', () => {
        storage.setItem('test_prefix.settings', JSON.stringify({ compact: true }));

        const value = service.get<{ compact: boolean }>('settings');

        expect(value).toEqual({ compact: true });
      });

      it('should return null for missing values', () => {
        expect(service.get('missing')).toBeNull();
      });

      it('should remove a stored value', () => {
        service.set('settings', { compact: true });

        service.remove('settings');

        expect(storage.getItem('test_prefix.settings')).toBeNull();
      });

      it('should clear only values with the configured prefix', () => {
        storage.setItem('test_prefix.one', JSON.stringify(1));
        storage.setItem('test_prefix.two', JSON.stringify(2));
        storage.setItem('other.three', JSON.stringify(3));

        service.clear();

        expect(storage.getItem('test_prefix.one')).toBeNull();
        expect(storage.getItem('test_prefix.two')).toBeNull();
        expect(storage.getItem('other.three')).toBe(JSON.stringify(3));
      });
    });
  }

  runStorageTests('localStorage');
  runStorageTests('sessionStorage');
});
