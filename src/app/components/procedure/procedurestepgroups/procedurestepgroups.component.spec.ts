import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { BlacklineComponent } from '@app/components/blackline/blackline.component';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { LineEditCommentsComponent } from '@app/components/line-edit-comments/line-edit-comments.component';
import { SignCommentComponent } from '@app/components/line-edit-comments/sign-comment/sign-comment.component';
import { RunCloseoutStickyCommentSummaryComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment-summary/run-closeout-sticky-comment-summary.component';
import { RunCloseoutStickyCommentComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunstepcommentComponent } from '@app/components/run/runstepcomment/runstepcomment.component';
import { TablestepentryComponent } from '@app/components/step/tablestepentry/tablestepentry.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { InViewportDirective } from '@app/directives/in-viewport.directive';
import { EquipmentEntryItemComponent } from '../procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from '../procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedurestepsComponent } from '../proceduresteps/proceduresteps.component';
import { ProcedurestepgroupsComponent } from './procedurestepgroups.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import { LineEditService } from '@app/services/line-edit.service';
import { stepBlackLineMockArray } from '@app/test/black-line.mock';
import { stepDefMock, stepDefMock2, stepDefMock3 } from '@app/test/step-def.mock';
import { RunDataEntryService } from '@app/services/run-data-entry.service';
import * as _ from 'lodash';


describe('ProcedurestepgroupsComponent', () => {
  let component: ProcedurestepgroupsComponent;
  let fixture: ComponentFixture<ProcedurestepgroupsComponent>;
  let lineEditService;
  let runDataEntryService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        InViewportDirective,
      ],
      declarations: [
        ProcedurestepgroupsComponent,
        LineEditCommentsComponent,
        RunCloseoutStickyCommentComponent,
        RunCloseoutStickyCommentSummaryComponent,
        ProcedurestepsComponent,
        IconEsd0Component,
        UploadFileComponentComponent,
        TablestepentryComponent,
        ProcedureRunEquipmentEntryComponent,
        RunstepcommentComponent,
        BlacklineComponent,
        ImageDisplayComponentComponent,
        ContenteditableModel,
        EquipmentEntryItemComponent,
        SignCommentComponent,
        GenericCommentHistoryDisplayComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ],
      providers: [
        LineEditService,
        RunDataEntryService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedurestepgroupsComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    component.procedureData.stepGroupDefs = [stepGroupDefMock];
    component.stepGroup = stepGroupDefMock;
    component.stepGroup.stepDefs = [stepDefMock, stepDefMock2];
    lineEditService = fixture.debugElement.injector.get(LineEditService);
    spyOn(lineEditService, 'announceBlackLineChange').and.callThrough();
    runDataEntryService = fixture.debugElement.injector.get(RunDataEntryService);
    spyOn(runDataEntryService, 'announceRunStepDefChange').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to line edit service and update', fakeAsync(() => {
    expect(component.stepGroup.stepDefs.length).toEqual(2);
    expect(component.stepGroup.stepDefs[0].blackLineComments.length).toEqual(0);
    component.updateStepLineEditsSubscription();
    lineEditService.announceBlackLineChanges(stepBlackLineMockArray);
    expect(lineEditService.announceBlackLineChange).toHaveBeenCalled();

    tick();
    expect(component.stepGroup.stepDefs.length).toEqual(2);
    expect(component.stepGroup.stepDefs[0].blackLineComments.length).toEqual(1);
    expect(component.stepGroup.stepDefs[0].blackLineComments[0]).toEqual(stepBlackLineMockArray[0]);
  }));

  it('should subscribe to run data entry service and update checkbox step', fakeAsync(() => {
    expect(component.stepGroup.stepDefs.length).toEqual(2);
    expect(component.stepGroup.stepDefs[1].runValue).toBeNull();
    expect(component.stepGroup.stepDefs[1].runValueSavedTimestamp).toBeNull();
    let stepToChange = _.cloneDeep(stepDefMock2);
    stepToChange.runValue = true;
    runDataEntryService.announceRunStepDefChange(stepToChange);
    expect(runDataEntryService.announceRunStepDefChange).toHaveBeenCalled();

    tick();
    expect(component.stepGroup.stepDefs.length).toEqual(2);
    expect(component.stepGroup.stepDefs[1].runValue).toBeTrue();
  }));

  it('should subscribe to run data entry service and update table step', fakeAsync(() => {
    const expectedNonEditableValue = 'testValue';
    component.stepGroup.stepDefs.push(stepDefMock3)
    expect(component.stepGroup.stepDefs.length).toEqual(3);
    expect(component.stepGroup.stepDefs[2].stepTableRows[0].stepTableCells[0].nonEditableValue).toEqual('');
    expect(component.stepGroup.stepDefs[2].runValueSavedTimestamp).toBeNull();
    let stepToChange = _.cloneDeep(stepDefMock3);
    stepToChange.stepTableRows[0].stepTableCells[0].nonEditableValue = expectedNonEditableValue
    runDataEntryService.announceRunStepDefChange(stepToChange);
    expect(runDataEntryService.announceRunStepDefChange).toHaveBeenCalled();

    tick();
    expect(component.stepGroup.stepDefs.length).toEqual(3);
    expect(component.stepGroup.stepDefs[2].stepTableRows[0].stepTableCells[0].nonEditableValue).toEqual(expectedNonEditableValue);
  }));
});
