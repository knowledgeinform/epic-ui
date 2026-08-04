import { UntypedFormArray } from '@angular/forms';
import { Observable } from 'rxjs';

export class FormArrayTyped<T> extends UntypedFormArray {
  public getValue(): T[] {
    return this.value;
  }
  public getValueChanges(): Observable<T[]> {
    return this.valueChanges;
  }
}
