import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepdefinitionComponent } from './stepdefinition.component';
import { AppTestingModule } from '@app/app-testing-module';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { TablestepentryComponent } from '../tablestepentry/tablestepentry.component';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { ContenteditableModel } from '@app/components/contenteditable-model/contenteditable-model.component';
import { stepDefMock } from '@app/test/step-def.mock';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { stepGroupDefMock } from '@app/test/step-group-def.mock';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";

describe('StepdefinitionComponent', () => {
  let component: StepdefinitionComponent;
  let fixture: ComponentFixture<StepdefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
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
    fixture = TestBed.createComponent(StepdefinitionComponent);
    component = fixture.componentInstance;
    component.step = stepDefMock;
    component.procedureData = procedureDetailsLockedRunMock;
    component.stepGroup = stepGroupDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
