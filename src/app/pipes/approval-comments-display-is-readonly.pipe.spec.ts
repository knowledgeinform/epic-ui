import { ApprovalCommentsDisplayIsReadonlyPipe } from './approval-comments-display-is-readonly.pipe';

describe('ApprovalCommentsDisplayIsEditablePipe', () => {
  it('create an instance', () => {
    const pipe = new ApprovalCommentsDisplayIsReadonlyPipe();
    expect(pipe).toBeTruthy();
  });
});
