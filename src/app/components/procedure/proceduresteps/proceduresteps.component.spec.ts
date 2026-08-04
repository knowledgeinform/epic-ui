import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { stepDefMock4 } from '@app/test/step-def.mock';
import { EquipmentEntryItemComponent } from '../procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import { ProcedureRunEquipmentEntryComponent } from '../procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import { ProcedurestepsComponent } from './proceduresteps.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import { mandatoryInspectionSecondSignatureMock, witnessSecondSignatureMock } from '@app/test/second-signature.mock';
import { StepDef } from '@app/interfaces/step-def.interface';
import * as _ from 'lodash';
import { SimpleChange } from '@angular/core';


describe('ProcedurestepsComponent', () => {
  let component: ProcedurestepsComponent;
  let fixture: ComponentFixture<ProcedurestepsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedurestepsComponent,
        IconEsd0Component,
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
        TablestepentryComponent,
        ProcedureRunEquipmentEntryComponent,
        EquipmentEntryItemComponent,
        RunstepcommentComponent,
        BlacklineComponent,
        ImageDisplayComponentComponent,
        ContenteditableModel,
        EquipmentEntryItemComponent,
        LineEditCommentsComponent,
        RunCloseoutStickyCommentComponent,
        RunCloseoutStickyCommentSummaryComponent,
        SignCommentComponent,
        GenericCommentHistoryDisplayComponent,
        CommentChangeTypeSelectComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedurestepsComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    component.step = _.cloneDeep(stepDefMock4);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display signature blocks initially', () => {
    expect(component.displayWitnessEntry).toBeTrue();
    expect(component.displayInspectionEntry).toBeTrue();
  });

  it('should display mandatory inspection signature when step changes and hide signature entry', () => {
    let validateStepSpy = spyOn<ProcedurestepsComponent, any>(component, 'validateStep').and.callThrough();
    const mandatoryInspectionSignature = mandatoryInspectionSecondSignatureMock;
    mandatoryInspectionSignature.stepDef = component.step.asDTO();
    const stepToUseForData: Partial<StepDef> = {mandatoryInspectionSecondSignature: mandatoryInspectionSignature};
    _.assign(component.step, stepToUseForData);
    component.ngOnChanges({step: new SimpleChange(null, component.step, false)});
    expect(validateStepSpy).toHaveBeenCalled();
    expect(component.displayInspectionEntry).toBeFalse();
  })

  it('should display witness signature when step changes and hide signature entry', () => {
    let validateStepSpy = spyOn<ProcedurestepsComponent, any>(component, 'validateStep').and.callThrough();
    const witnessSignature = witnessSecondSignatureMock;
    witnessSignature.stepDef = component.step.asDTO();
    const stepToUseForData: Partial<StepDef> = {witnessSecondSignature: witnessSignature};
    _.assign(component.step, stepToUseForData);
    component.ngOnChanges({step: new SimpleChange(null, component.step, false)});
    expect(validateStepSpy).toHaveBeenCalled();
    expect(component.displayWitnessEntry).toBeFalse();
  })

});
