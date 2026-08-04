import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummernoteEditorComponent } from './summernote-editor.component';
import { NgxSummernoteModule} from "ngx-summernote";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import {AppTestingModule} from "@app/app-testing-module";

describe('SummernoteEditorComponent', () => {
  let component: SummernoteEditorComponent;
  let fixture: ComponentFixture<SummernoteEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      declarations: [ SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummernoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
