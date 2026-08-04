import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureinstructioninfoComponent } from './procedureinstructioninfo.component';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { procedureInstructionMock } from '@app/test/procedure-instruction.mock';
import {ProcedureInstruction} from '@app/interfaces/procedure-instruction';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";

describe('ProcedureinstructioninfoComponent', () => {
  let component: ProcedureinstructioninfoComponent;
  let fixture: ComponentFixture<ProcedureinstructioninfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedureinstructioninfoComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureinstructioninfoComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    component.instruction = new ProcedureInstruction().loadFromDTO(procedureInstructionMock);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
