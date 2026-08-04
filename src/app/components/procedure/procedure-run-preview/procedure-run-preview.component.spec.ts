import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { RunCloseoutStickyCommentSummaryComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment-summary/run-closeout-sticky-comment-summary.component';
import { RunCloseoutStickyCommentComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunstepcommentComponent } from '@app/components/run/runstepcomment/runstepcomment.component';
import { TablestepentryComponent } from '@app/components/step/tablestepentry/tablestepentry.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { ProcedureFavoriteComponent } from '../procedure-favorite/procedure-favorite.component';
import { ProcedureHazardComponent } from '../procedure-hazard/procedure-hazard.component';
import { ProcedureInstructionInfoContainerComponent } from '../instructions/procedure-instruction-info-container/procedure-instruction-info-container.component';
import { EquipmentEntryItemComponent } from '../procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from '../procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedureheaderComponent } from '../procedureheader/procedureheader.component';
import { ProcedureinstructioninfoComponent } from '../instructions/procedureinstructioninfo/procedureinstructioninfo.component';
import { ProcedurestepgroupsComponent } from '../procedurestepgroups/procedurestepgroups.component';
import { ProcedurestepsComponent } from '../proceduresteps/proceduresteps.component';
import { ProcedurestepscontainerComponent } from '../procedurestepscontainer/procedurestepscontainer.component';
import { ProcedurestepsnavlistitemComponent } from '../procedurestepsnavlistitem/procedurestepsnavlistitem.component';
import { ProcedureRunPreviewComponent } from './procedure-run-preview.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";


describe('ProcedureRunPreviewComponent', () => {
  let component: ProcedureRunPreviewComponent;
  let fixture: ComponentFixture<ProcedureRunPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      declarations: [
        ProcedureRunPreviewComponent,
        ProcedureHazardComponent,
        CheckboxEsd0Component,
        ProcedureheaderComponent,
        ProcedureInstructionInfoContainerComponent,
        ProcedureinstructioninfoComponent,
        ProcedureRunPreviewComponent,
        ProcedurestepscontainerComponent,
        ProcedurestepsComponent,
        ProcedureFavoriteComponent,
        UploadFileComponentComponent,
        ProcedurestepsnavlistitemComponent,
        ProcedurestepgroupsComponent,
        IconEsd0Component,
        TablestepentryComponent,
        ProcedureRunEquipmentEntryComponent,
        EquipmentEntryItemComponent,
        RunstepcommentComponent,
        BlacklineComponent,
        LineEditCommentsComponent,
        RunCloseoutStickyCommentComponent,
        RunCloseoutStickyCommentSummaryComponent,
        ImageDisplayComponentComponent,
        ContenteditableModel,
        GenericCommentHistoryDisplayComponent,
        SignCommentComponent,
        StatusHistoryComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureRunPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
