import { inject, Injectable } from '@angular/core';
import {
  LOCAL_STORAGE_CONFIG,
  LocalStorageConfig,
} from './local-storage.config';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly config = inject(LOCAL_STORAGE_CONFIG);

  private readonly prefix = this.config.prefix ? `${this.config.prefix}.`: '';

  private readonly storage: Storage =
      this.config.storageType === 'sessionStorage'
        ? window.sessionStorage
        : window.localStorage;

  get<T = unknown>(key: string): T | null {
    const raw = this.storage.getItem(this.key(key));
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  set<T = unknown>(key: string, value: T): void {
    this.storage.setItem(this.key(key), JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(this.key(key));
  }

  clear(): void {
    Object.keys(this.storage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => this.storage.removeItem(key));
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }
}
