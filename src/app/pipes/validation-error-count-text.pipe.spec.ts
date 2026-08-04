import { ValidationErrorCountTextPipe } from './validation-error-count-text.pipe';

describe('ValidationErrorCountTextPipe', () => {
  it('create an instance', () => {
    const pipe = new ValidationErrorCountTextPipe();
    expect(pipe).toBeTruthy();
  });
});
