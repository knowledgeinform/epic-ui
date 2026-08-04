import { Subject } from 'rxjs';

export class SwUpdateServiceMock {
  public available = new Subject<{available: {hash: string}}>().asObservable();
  public activated = new Subject<{current: {hash: string}}>().asObservable();
  public isEnabled = false;

  public activateUpdate() {
    return Promise.resolve();
  }

  public checkForUpdate() {
    return Promise.resolve();
  }

  constructor() {}
}
