import { LockButtonTextPipe } from './lock-button-text.pipe';

describe('LockButtonTextPipe', () => {
  it('create an instance', () => {
    const pipe = new LockButtonTextPipe();
    expect(pipe).toBeTruthy();
  });

  it('transform displays correct text when true', () => {
    const pipe = new LockButtonTextPipe();
    expect(pipe.transform(true)).toEqual('Locked from editing. Click to unlock!');
  });

  it('transform display correct text when false', () => {
    const pipe = new LockButtonTextPipe();
    expect(pipe.transform(false)).toEqual('Unlocked for editing. Click to lock!');
  })
});
