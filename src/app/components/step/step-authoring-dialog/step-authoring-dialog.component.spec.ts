import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepAuthoringDialogComponent } from './step-authoring-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { StepdefinitionComponent } from '../stepdefinition/stepdefinition.component';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { TablestepentryComponent } from '../tablestepentry/tablestepentry.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";

describe('StepAuthoringDialogComponent', () => {
  let component: StepAuthoringDialogComponent;
  let fixture: ComponentFixture<StepAuthoringDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        StepAuthoringDialogComponent,
        StepdefinitionComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
        TablestepentryComponent,
        ContenteditableModel,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepAuthoringDialogComponent);
    component = fixture.componentInstance;
    component.stepGroup = stepGroupDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
