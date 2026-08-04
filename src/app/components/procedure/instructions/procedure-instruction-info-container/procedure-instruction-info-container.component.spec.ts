import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureInstructionInfoContainerComponent } from './procedure-instruction-info-container.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProcedureinstructioninfoComponent } from '../procedureinstructioninfo/procedureinstructioninfo.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";

describe('ProcedureInstructionInfoContainerComponent', () => {
  let component: ProcedureInstructionInfoContainerComponent;
  let fixture: ComponentFixture<ProcedureInstructionInfoContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureInstructionInfoContainerComponent,
        ProcedureinstructioninfoComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureInstructionInfoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
