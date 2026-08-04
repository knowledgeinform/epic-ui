import { procedureDetailsDraft1Mock, procedureDetailsDraft2Mock, procedureDetailsInReviewMock } from '@app/test/procedure-details.mock';
import { ShowApproverCommentsPipe } from './show-approver-comments.pipe';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsDTOLockedRunMock } from '@app/test/procedure-details-dto.mock';

describe('ShowApproverCommentsPipe', () => {
  it('create an instance', () => {
    const pipe = new ShowApproverCommentsPipe();
    expect(pipe).toBeTruthy();
  });

  it('return true for non-DRAFT', () => {
    const pipe = new ShowApproverCommentsPipe();
    const actualValue = pipe.transform(procedureDetailsInReviewMock);
    expect(actualValue).toBeTrue();
  });

  it('return false for DRAFT with no approvers', () => {
    const pipe = new ShowApproverCommentsPipe();
    const actualValue = pipe.transform(procedureDetailsDraft1Mock);
    expect(actualValue).toBeFalse();
  });

  it('return true for DRAFT with approvers', () => {
    const pipe = new ShowApproverCommentsPipe();
    const actualValue = pipe.transform(procedureDetailsDraft2Mock);
    expect(actualValue).toBeTrue;
  })
});
