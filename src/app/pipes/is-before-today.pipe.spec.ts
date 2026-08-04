import { IsBeforeTodayPipe } from './is-before-today.pipe';

describe('IsBeforeTodayPipe', () => {
  it('create an instance', () => {
    const pipe = new IsBeforeTodayPipe();
    expect(pipe).toBeTruthy();
  });
});
