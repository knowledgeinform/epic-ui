import { InjectionToken } from '@angular/core';

export type LocalStorageType = 'localStorage' | 'sessionStorage';

export interface LocalStorageConfig {
  prefix?: string;
  storageType?: LocalStorageType;
}

export const LOCAL_STORAGE_CONFIG = new InjectionToken<LocalStorageConfig>(
  'LOCAL_STORAGE_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({
      prefix: '',
      storageType: 'localStorage',
    }),
  },
);
