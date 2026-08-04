import { Observable, Subject } from 'rxjs';

export class ActivatedRouteMock {
  get paramMap() {
    return new Observable();
  }
}
