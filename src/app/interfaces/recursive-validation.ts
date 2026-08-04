import { ValidationErrors } from './validation-errors';

export class RecursiveValidation<T> {
  public errors?: ErrorSet[];
  public element: T;
  public childErrorCount: number = 0;
  public selfAndChildErrorCount: number = 0;

  constructor(element: T) {
    this.element = element;
  }

  public updateChildErrorCount(): number {
    return this.childErrorCount;
  }

  public updateSelfAndChildErrorCount(): number {
    const count = this.updateChildErrorCount() + (this.errors ? this.errors.length : 0);
    this.selfAndChildErrorCount = count;
    return this.selfAndChildErrorCount;
  }
}

export interface ErrorSet {
  error: ValidationErrors;
  description: string;
}
