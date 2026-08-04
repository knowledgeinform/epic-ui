import { Subject } from "rxjs";

export class OfflineServiceMock {
  get offline(): boolean {
    return true;
  }  set offline(newStatus: boolean) {
  }
  get serverOffline(): boolean {
    return false;
  }
  set serverOffline(newStatus: boolean) {
  }
  public clientOffline: boolean;
  public offlineSubject: Subject<boolean>;
  public serverOfflineSubject: Subject<boolean>;
  public get statusExplanation(): string {
    return '';
  }
}
