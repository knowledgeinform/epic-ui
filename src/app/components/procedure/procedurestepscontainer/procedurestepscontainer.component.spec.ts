import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { BlacklineComponent } from '@app/components/blackline/blackline.component';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { LineEditCommentsComponent } from '@app/components/line-edit-comments/line-edit-comments.component';
import { SignCommentComponent } from '@app/components/line-edit-comments/sign-comment/sign-comment.component';
import { RunCloseoutStickyCommentComponent } from '@app/components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import { RunstepcommentComponent } from '@app/components/run/runstepcomment/runstepcomment.component';
import { TablestepentryComponent } from '@app/components/step/tablestepentry/tablestepentry.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { StepDisplayOrderPipe } from '@app/pipes/step-display-order.pipe';
import { EquipmentEntryItemComponent } from '../procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from '../procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedurestepgroupsComponent } from '../procedurestepgroups/procedurestepgroups.component';
import { ProcedurestepsComponent } from '../proceduresteps/proceduresteps.component';
import { ProcedurestepsnavlistitemComponent } from '../procedurestepsnavlistitem/procedurestepsnavlistitem.component';
import { ProcedurestepscontainerComponent } from './procedurestepscontainer.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";


describe('ProcedurestepscontainerComponent', () => {
  let component: ProcedurestepscontainerComponent;
  let fixture: ComponentFixture<ProcedurestepscontainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      declarations: [
        ProcedurestepscontainerComponent,
        ProcedurestepsnavlistitemComponent,
        ProcedurestepgroupsComponent,
        LineEditCommentsComponent,
        RunCloseoutStickyCommentComponent,
        ProcedurestepsComponent,
        IconEsd0Component,
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
        TablestepentryComponent,
        ProcedureRunEquipmentEntryComponent,
        RunstepcommentComponent,
        BlacklineComponent,
        ContenteditableModel,
        EquipmentEntryItemComponent,
        GenericCommentHistoryDisplayComponent,
        SignCommentComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedurestepscontainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
