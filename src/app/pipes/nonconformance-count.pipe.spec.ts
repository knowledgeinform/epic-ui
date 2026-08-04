import { NonconformanceCountPipe } from './nonconformance-count.pipe';

describe('NonconformanceCountPipe', () => {
  it('create an instance', () => {
    const pipe = new NonconformanceCountPipe();
    expect(pipe).toBeTruthy();
  });
});
