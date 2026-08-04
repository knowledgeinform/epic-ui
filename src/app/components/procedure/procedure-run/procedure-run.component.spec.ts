import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { AppTestingModule } from '@app/app-testing-module';
import { AppComponent } from '@app/components/app/app.component';
import { BlacklineComponent } from '@app/components/blackline/blackline.component';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { LineEditCommentsComponent } from '@app/components/line-edit-comments/line-edit-comments.component';
import { SignCommentComponent } from '@app/components/line-edit-comments/sign-comment/sign-comment.component';
import { OfflineAvailabilityIndicatorComponent } from '@app/components/offline-availability-indicator/offline-availability-indicator.component';
import { StatusHistoryComponent } from '@app/components/procedure/status-history/status-history.component';
import { RunApproverCommentDisplayComponent } from '@app/components/run/run-closeout/run-approver/run-approver-comment-display/run-approver-comment-display.component';
import { RunApproverCommentComponent } from '@app/components/run/run-closeout/run-approver/run-approver-comment/run-approver-comment.component';
import { RunCloseoutCompletedComponent } from '@app/components/run/run-closeout/run-closeout-completed/run-closeout-completed.component';
import { RunCloseoutContainerComponent } from '@app/components/run/run-closeout/run-closeout-container/run-closeout-container.component';
import { RunCloseoutReviewingComponent } from '@app/components/run/run-closeout/run-closeout-reviewing/run-closeout-reviewing.component';
import { RunCloseoutStickyCommentSummaryComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment-summary/run-closeout-sticky-comment-summary.component';
import { RunCloseoutStickyCommentComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunCloseoutSubmissionComponent } from '@app/components/run/run-closeout/run-closeout-submission/run-closeout-submission.component';
import { RunSummaryComponent } from '@app/components/run/run-summary/run-summary.component';
import { RunstepcommentComponent } from '@app/components/run/runstepcomment/runstepcomment.component';
import { TablestepentryComponent } from '@app/components/step/tablestepentry/tablestepentry.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { SwUpdateServiceMock } from '@app/services/sw-update.service.mock';
import { ApproverActionComponent } from '../approver-action/approver-action.component';
import { ProcedureApprovalCommentDisplayComponent } from '../procedure-approval-comment-display/procedure-approval-comment-display.component';
import { ProcedureApprovalCommentComponent } from '../procedure-approval-comment/procedure-approval-comment.component';
import { ProcedureFavoriteComponent } from '../procedure-favorite/procedure-favorite.component';
import { ProcedureHazardBannerComponent } from '../procedure-hazard-banner/procedure-hazard-banner.component';
import { ProcedureHazardComponent } from '../procedure-hazard/procedure-hazard.component';
import { ProcedureInstructionInfoContainerComponent } from '../instructions/procedure-instruction-info-container/procedure-instruction-info-container.component';
import { ProcedureTransitionReleaseComponent } from '../procedure-transition-release/procedure-transition-release.component';
import { ProcedureTransitionComponent } from '../procedure-transition/procedure-transition.component';
import { ProcedureheaderComponent } from '../procedureheader/procedureheader.component';
import { ProcedureinstructioninfoComponent } from '../instructions/procedureinstructioninfo/procedureinstructioninfo.component';
import { ProcedurestepgroupsComponent } from '../procedurestepgroups/procedurestepgroups.component';
import { ProcedurestepsComponent } from '../proceduresteps/proceduresteps.component';
import { ProcedurestepscontainerComponent } from '../procedurestepscontainer/procedurestepscontainer.component';
import { ProcedurestepsnavlistitemComponent } from '../procedurestepsnavlistitem/procedurestepsnavlistitem.component';
import { EquipmentEntryItemComponent } from './procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from './procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedureRunComponent } from './procedure-run.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";
import { LineEditService } from '@app/services/line-edit.service';
import { procedureDataBlackLineMockArray, stepBlackLineMockArray } from '@app/test/black-line.mock';
import {runMock} from "@app/test/run.mock";
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import { stepDefMock } from '@app/test/step-def.mock';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { LineEditReportingService } from '@app/services/line-edit-reporting.service';


describe('ProcedureRunComponent', () => {
  let component: ProcedureRunComponent;
  let fixture: ComponentFixture<ProcedureRunComponent>;
  let lineEditService;
  let lineEditReportingService: LineEditReportingService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      providers: [
        AppComponent,
        { provide: SwUpdate, useClass: SwUpdateServiceMock },
        LineEditService
      ],
      declarations: [
        ProcedureRunComponent,
        ProcedureHazardBannerComponent,
        ProcedureHazardComponent,
        ProcedureheaderComponent,
        ProcedureInstructionInfoContainerComponent,
        ProcedurestepscontainerComponent,
        ProcedureTransitionComponent,
        ProcedureTransitionReleaseComponent,
        ProcedureApprovalCommentDisplayComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
        ProcedureFavoriteComponent,
        UploadFileComponentComponent,
        ProcedureinstructioninfoComponent,
        ProcedurestepsnavlistitemComponent,
        ProcedurestepgroupsComponent,
        ApproverActionComponent,
        ProcedureApprovalCommentComponent,
        ProcedureApprovalCommentDisplayComponent,
        ImageDisplayComponentComponent,
        LineEditCommentsComponent,
        RunCloseoutStickyCommentComponent,
        ProcedurestepsComponent,
        TablestepentryComponent,
        BlacklineComponent,
        ProcedureRunEquipmentEntryComponent,
        RunstepcommentComponent,
        ContenteditableModel,
        EquipmentEntryItemComponent,
        OfflineAvailabilityIndicatorComponent,
        RunCloseoutStickyCommentComponent,
        RunCloseoutStickyCommentSummaryComponent,
        RunSummaryComponent,
        RunCloseoutContainerComponent,
        RunApproverCommentDisplayComponent,
        RunCloseoutSubmissionComponent,
        RunCloseoutReviewingComponent,
        RunCloseoutCompletedComponent,
        RunApproverCommentComponent,
        GenericCommentHistoryDisplayComponent,
        SignCommentComponent,
        StatusHistoryComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureRunComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    lineEditService = fixture.debugElement.injector.get(LineEditService);
    lineEditReportingService = fixture.debugElement.injector.get(LineEditReportingService);

    spyOn(lineEditService, 'announceBlackLineChange').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to line edit service and update', fakeAsync(() => {
    expect(component.procedureData.blackLineComments.length).toEqual(0);
    component.updateProcedureDataLineEdits();
    lineEditService.announceBlackLineChanges(procedureDataBlackLineMockArray);
    expect(lineEditService.announceBlackLineChange).toHaveBeenCalled();

    tick();
    expect(component.procedureData.blackLineComments.length).toEqual(2);
    expect(component.procedureData.blackLineComments[0]).toEqual(procedureDataBlackLineMockArray[0]);
  }));

  it('should refresh values on F8', () => {
    component.run = runMock;
    let refreshValuesSpy = spyOn<ProcedureRunComponent, any>(component, 'refreshValues');

    let e = new KeyboardEvent('keyup', {
      key: 'F8'
    });

    dispatchEvent(e);
    expect(refreshValuesSpy).toHaveBeenCalled();
  });

  it('should keep the newly saved procedure blackline in summary even if the immediate refresh is stale', () => {
    const procedureData = _.cloneDeep(procedureDetailsLockedRunMock);
    procedureData.blackLineComments = [];
    procedureData.stepGroupDefs = [];
    procedureData.procedureInstructions = [];
    const staleRun = _.cloneDeep(runMock);
    staleRun.procedureDetails = _.cloneDeep(procedureData);

    component.runId = 'run-1';
    component.run = _.cloneDeep(runMock);
    component.run.procedureDetails = procedureData;
    component.procedureData = procedureData;

    const savedProcedureBlackline = _.cloneDeep(procedureDataBlackLineMockArray[0]);
    savedProcedureBlackline.pk = 9991;
    savedProcedureBlackline.commentText = 'stale refresh procedure blackline';
    savedProcedureBlackline.procedureDetails = { pk: procedureData.pk } as any;

    spyOn(component.epicService, 'getRun').and.returnValue(of(staleRun as any));

    lineEditReportingService.findAllLineEdits(component.procedureData);
    expect(lineEditReportingService.totalBlackLineCount.getCount(component.procedureData.pk)).toEqual(0);

    lineEditService.announceBlackLineChanges([savedProcedureBlackline]);

    expect(lineEditReportingService.totalBlackLineCount.getCount(component.procedureData.pk)).toEqual(1);
  });

  it('should keep the newly saved step blackline in summary even if the immediate refresh is stale', () => {
    const procedureData = _.cloneDeep(procedureDetailsLockedRunMock);
    procedureData.blackLineComments = [];
    procedureData.procedureInstructions = [];
    const stepGroup = _.cloneDeep(stepGroupDefMock);
    const step = _.cloneDeep(stepDefMock);
    step.blackLineComments = [];
    step.stepGroupDef = stepGroup;
    stepGroup.stepDefs = [step];
    stepGroup.procedureDetails = procedureData;
    procedureData.stepGroupDefs = [stepGroup];

    const staleRun = _.cloneDeep(runMock);
    staleRun.procedureDetails = _.cloneDeep(procedureData);

    component.runId = 'run-2';
    component.run = _.cloneDeep(runMock);
    component.run.procedureDetails = procedureData;
    component.procedureData = procedureData;
    component.selectionIndex = 0;

    const savedStepBlackline = _.cloneDeep(stepBlackLineMockArray[0]);
    savedStepBlackline.pk = 9992;
    savedStepBlackline.commentText = 'stale refresh step blackline';
    savedStepBlackline.procedureDetails = null;
    savedStepBlackline.stepDef = step.asDTO();

    spyOn(component.epicService, 'getRun').and.returnValue(of(staleRun as any));

    lineEditReportingService.findAllLineEdits(component.procedureData);
    expect(lineEditReportingService.stepBlackLineCount.getCount(component.procedureData.pk)).toEqual(0);
    expect(component.procedureData.stepGroupDefs[0].stepDefs[0].blackLineComments.length).toEqual(0);

    lineEditService.announceBlackLineChanges([savedStepBlackline]);

    expect(component.procedureData.stepGroupDefs[0].stepDefs[0].blackLineComments.length).toEqual(1);
    expect(component.procedureData.stepGroupDefs[0].stepDefs[0].blackLineComments[0].pk).toEqual(savedStepBlackline.pk);
    expect(lineEditReportingService.stepBlackLineCount.getCount(component.procedureData.pk)).toEqual(1);
  });

});
