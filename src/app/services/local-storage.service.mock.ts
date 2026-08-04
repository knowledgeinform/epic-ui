import { Injectable } from "@angular/core";
@Injectable()
export class LocalStorageServiceMock {
  public get(string: String) {
    return '';
  }
  public set(key: String, val: String) {}
  public remove(key: String) {}
  public clear() {}
}
