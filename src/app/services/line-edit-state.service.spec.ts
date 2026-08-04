import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { BlackLineDto } from '@app/interfaces/black-line.dto';
import { LineEditReportingService } from '@app/services/line-edit-reporting.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { programRoleMock } from '@app/test/program-role.mock';
import { stepDefMock } from '@app/test/step-def.mock';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { usersDtoMock } from '@app/test/users.dto.mock';
import { SecondSignatureType } from '@app/interfaces/second-signature.dto';

describe('LineEditStateService', () => {
  let service: LineEditStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LineEditReportingService,
        LineEditStateService
      ]
    });

    service = TestBed.inject(LineEditStateService);
  });

  it('should preserve existing step blackline metadata when applying a saved manual validation blackline', () => {
    const procedureData = _.cloneDeep(procedureDetailsLockedRunMock);
    const stepGroup = _.cloneDeep(stepGroupDefMock);
    const step = _.cloneDeep(stepDefMock);
    stepGroup.stepDefs = [step];
    stepGroup.procedureDetails = procedureData;
    step.stepGroupDef = stepGroup;
    procedureData.stepGroupDefs = [stepGroup];

    const existingComment = new BlackLineDto({
      pk: 101,
      commentText: 'existing step blackline',
      procedureDetails: { pk: procedureData.pk } as any,
      stepDef: step.asDTO(),
      users: usersDtoMock,
      procedureChangeType: {
        pk: 77,
        name: 'Existing Change Type',
        isEnabled: true,
        acceptsAllSignatures: false,
        description: 'requires approval',
        deletable: false,
        programPk: 1,
        requiredRoleApprovals: [programRoleMock.asDTO()]
      },
      blackRedLineSignatures: [{
        pk: 501,
        timestamp: new Date(),
        type: SecondSignatureType.BLACK_RED_LINE,
        user: usersDtoMock,
        comment: { pk: 101 } as any,
        programRole: programRoleMock.asDTO()
      }]
    });
    step.blackLineComments = [existingComment];

    const savedManualValidationBlackline = new BlackLineDto({
      pk: 202,
      commentText: 'bulk MV',
      procedureDetails: { pk: procedureData.pk } as any,
      stepDef: {
        ...step.asDTO(),
        isManualValidation: true,
        blackLineComments: [{
          pk: existingComment.pk,
          procedureChangeType: null,
          blackRedLineSignatures: null
        } as any]
      } as any,
      users: usersDtoMock,
      blackRedLineSignatures: []
    });

    service.applySavedBlackLine(procedureData, savedManualValidationBlackline);

    const updatedStep = procedureData.stepGroupDefs[0].stepDefs[0];
    const preservedComment = updatedStep.blackLineComments.find(comment => comment.pk === existingComment.pk);

    expect(updatedStep.blackLineComments.length).toBe(2);
    expect(preservedComment).toBeTruthy();
    expect(preservedComment.procedureChangeType?.name).toBe('Existing Change Type');
    expect(preservedComment.procedureChangeType?.requiredRoleApprovals?.length).toBe(1);
    expect(preservedComment.blackRedLineSignatures?.length).toBe(1);
    expect(updatedStep.isManualValidation).toBeTrue();
  });
});
