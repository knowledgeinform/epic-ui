import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { AppTestingModule } from '@app/app-testing-module';
import { BlacklineComponent } from '@app/components/blackline/blackline.component';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { LineEditCommentsComponent } from '@app/components/line-edit-comments/line-edit-comments.component';
import { SignCommentComponent } from '@app/components/line-edit-comments/sign-comment/sign-comment.component';
import { StatusHistoryComponent } from '@app/components/procedure/status-history/status-history.component';
import { RunCloseoutStickyCommentComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunstepcommentComponent } from '@app/components/run/runstepcomment/runstepcomment.component';
import { TablestepentryComponent } from '@app/components/step/tablestepentry/tablestepentry.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { SwUpdateServiceMock } from '@app/services/sw-update.service.mock';
import { AppComponent } from '../../app/app.component';
import { ApproverActionComponent } from '../approver-action/approver-action.component';
import { ProcedureApprovalCommentDisplayComponent } from '../procedure-approval-comment-display/procedure-approval-comment-display.component';
import { ProcedureApprovalCommentComponent } from '../procedure-approval-comment/procedure-approval-comment.component';
import { ProcedureFavoriteComponent } from '../procedure-favorite/procedure-favorite.component';
import { ProcedureHazardBannerComponent } from '../procedure-hazard-banner/procedure-hazard-banner.component';
import { ProcedureHazardComponent } from '../procedure-hazard/procedure-hazard.component';
import { ProcedureInstructionInfoContainerComponent } from '../instructions/procedure-instruction-info-container/procedure-instruction-info-container.component';
import { EquipmentEntryItemComponent } from '../procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from '../procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedureTransitionReleaseComponent } from '../procedure-transition-release/procedure-transition-release.component';
import { ProcedureTransitionComponent } from '../procedure-transition/procedure-transition.component';
import { ProcedureheaderComponent } from '../procedureheader/procedureheader.component';
import { ProcedureinstructioninfoComponent } from '../instructions/procedureinstructioninfo/procedureinstructioninfo.component';
import { ProcedurestepgroupsComponent } from '../procedurestepgroups/procedurestepgroups.component';
import { ProcedurestepsComponent } from '../proceduresteps/proceduresteps.component';
import { ProcedurestepscontainerComponent } from '../procedurestepscontainer/procedurestepscontainer.component';
import { ProcedurestepsnavlistitemComponent } from '../procedurestepsnavlistitem/procedurestepsnavlistitem.component';
import { AuthorprocedureComponent } from './authorprocedure.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import {procedureDetailsDraft1Mock} from "@app/test/procedure-details.mock";
import { AppService } from '@app/services/app.service';
import { procedureDetailsDTODraft1Mock } from '@app/test/procedure-details-dto.mock';
import { procedureDefMock } from '@app/test/procedure-def.mock';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { EPICWSService } from '@app/services/epic-ws.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';



describe('AuthorprocedureComponent', () => {
  let component: AuthorprocedureComponent;
  let fixture: ComponentFixture<AuthorprocedureComponent>;
  let appService;
  let epicWSService;
  let route;
  let routeParams$;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AppComponent,
        CommentChangeTypeSelectComponent,
        { provide: SwUpdate, useClass: SwUpdateServiceMock },
        AppService,
        EPICWSService,
        { provide: ActivatedRoute, useValue: { params: new Subject().asObservable() } },
      ],
      declarations: [
        AuthorprocedureComponent,
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
        GenericCommentHistoryDisplayComponent,
        SignCommentComponent,
        StatusHistoryComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    routeParams$ = new Subject<any>();
    TestBed.overrideProvider(ActivatedRoute, { useValue: { params: routeParams$.asObservable() } });
    fixture = TestBed.createComponent(AuthorprocedureComponent);
    component = fixture.componentInstance;
    appService = fixture.debugElement.injector.get(AppService);
    epicWSService = fixture.debugElement.injector.get(EPICWSService);
    route = fixture.debugElement.injector.get(Router);
    spyOn(appService, 'announcePageTitleChange');
    spyOn(appService, 'announceBrowserTitleChange');
    spyOn(component.epicService, 'getProcedureDetailsByUniqueCode').and.returnValue(of(procedureDetailsDraft1Mock));
    spyOn(component.epicService, 'getProcedureDefByPk').and.returnValue(of({
      ...procedureDefMock,
      procedureDetails: [procedureDetailsDTODraft1Mock]
    }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    routeParams$.next({ id: procedureDetailsDTODraft1Mock.id, tab: 0 });
    expect(component.procedureData).toEqual(procedureDetailsDraft1Mock);
  });

  it('should call AppService announcements on page load', () => {
    routeParams$.next({ id: procedureDetailsDTODraft1Mock.id, tab: 0 });
    expect(epicWSService.getProcedureDetailsByUniqueCode).toHaveBeenCalled();
    expect(appService.announcePageTitleChange).toHaveBeenCalled();
    expect(appService.announceBrowserTitleChange).toHaveBeenCalled();
  })
});
