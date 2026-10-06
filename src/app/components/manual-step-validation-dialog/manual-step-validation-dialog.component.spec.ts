import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { AppTestingModule } from '@app/app-testing-module';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { procedureDetailsDTOLockedRunMock } from '@app/test/procedure-details-dto.mock';
import { createStepDefMock } from '@app/test/step-def.mock';
import * as _ from 'lodash';

import { CommentChangeTypeSelectComponent } from '../comment-change-type-select/comment-change-type-select.component';
import { RedBlackLineCommentComponent } from '../red-black-line-comment/red-black-line-comment.component';
import { ManualStepValidationDialogComponent } from './manual-step-validation-dialog.component';

describe('ManualStepValidationDialogComponent', () => {
  let component: ManualStepValidationDialogComponent;
  let fixture: ComponentFixture<ManualStepValidationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule
      ],
      declarations: [
        ManualStepValidationDialogComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(
      ManualStepValidationDialogComponent
    );

    component = fixture.componentInstance;

    // Give every test a fresh StepDef instance.
    component.target = [
      createStepDefMock()
    ];

    // Rebuild ProcedureDetails from a fresh copy of the DTO so this spec
    // cannot inherit mutations made by another test.
    component.procedureData = new ProcedureDetails().loadFromDTO(
      _.cloneDeep(procedureDetailsDTOLockedRunMock)
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});