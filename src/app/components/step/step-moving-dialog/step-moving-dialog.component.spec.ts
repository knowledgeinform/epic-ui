import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppTestingModule } from '@app/app-testing-module';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { MovedefinitionComponent } from '@app/components/movedefinition/movedefinition.component';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { RedLineComment } from '@app/interfaces/comment.dto';
import { StepDefDTO } from '@app/interfaces/step-def.dto.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { StepGroupDef } from '@app/interfaces/step-group-def';
import { procedureDetailsDTOLockedRunMock } from '@app/test/procedure-details-dto.mock';
import { stepDefMock } from '@app/test/step-def.mock';
import * as _ from 'lodash';
import { StepMovingDialogComponent } from './step-moving-dialog.component';


describe('StepMovingDialogComponent', () => {
  let component: StepMovingDialogComponent;
  let fixture: ComponentFixture<StepMovingDialogComponent>;
  let newStepPk: number = 0;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef, useValue: {
            close: () => { },
          }
        },
      ],
      declarations: [
        StepMovingDialogComponent,
        MovedefinitionComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepMovingDialogComponent);
    component = fixture.componentInstance;
    const baseStep = _.merge({}, stepDefMock);
    const procedureData = new ProcedureDetails().loadFromDTO(procedureDetailsDTOLockedRunMock);
    const parentGroup = new StepGroupDef().loadFromDTO({
      pk: 1000,
      displayOrder: 1,
      stepGroupName: 'Parent',
      stepDefs: [],
      stepGroupDefsChildren: [],
    });
    component.step = baseStep;
    component.procedureData = procedureData;
    component.parentSelected = parentGroup;
    component.olderSibling = baseStep;
    component.originalStepGroup = parentGroup;
    component.comment = new RedLineComment({procedureDetails: procedureData.asDTO()});
    fixture.detectChanges();
  });

  function createMockStepForMove(displayOrder): StepDefDTO {
    return _.assign({}, stepDefMock.asDTO(), {
      pk: newStepPk++,
      displayOrder,
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have step show up in new group when moved', () => {

    // Create mock group/steps.
    const fromGroup: StepGroupDef = new StepGroupDef().loadFromDTO({
      pk: 0,
      displayOrder: 0,
      stepGroupName: '0',
      stepDefs: [
        createMockStepForMove(0),
        createMockStepForMove(1),
      ],
    });
    const toGroup: StepGroupDef = new StepGroupDef().loadFromDTO({
      pk: 1,
      displayOrder: 1,
      stepGroupName: '1',
      stepDefs: [
        createMockStepForMove(0),
        createMockStepForMove(1),
      ],
    });
    const stepGroup = new StepGroupDef().loadFromDTO({
      pk: 2,
      displayOrder: 2,
      stepGroupName: 'parent',
      stepDefs: [],
      stepGroupDefsChildren: [],
    });
    stepGroup.stepGroupDefsChildren = [fromGroup, toGroup];
    const procedure = new ProcedureDetails().loadFromDTO(procedureDetailsDTOLockedRunMock);
    procedure.stepGroupDefs = [stepGroup];
    component.procedureData = procedure;

    // Move step to new group.
    const stepToMove = fromGroup.stepDefs[1];
    component.step = stepToMove;
    component.originalStepGroup = fromGroup;
    component.parentSelected = toGroup;
    component.olderSibling = toGroup.stepDefs[0];
    component.updateStep();


    // Verify step is in new group.
    expect(toGroup.stepDefs[1]).toBe(stepToMove);
    expect(_.find(fromGroup.stepDefs, step => step.pk == stepToMove.pk)).toBeFalsy();

  });



});
