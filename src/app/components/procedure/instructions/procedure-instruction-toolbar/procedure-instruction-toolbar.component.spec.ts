import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { InstructioninfoAuthoringDialogComponent } from "@app/components/procedure/instructions/instructioninfo-authoring-dialog/instructioninfo-authoring-dialog.component";
import {InstructioninfoCloningDialogComponent} from "@app/components/procedure/instructions/instructioninfo-cloning-dialog/instructioninfo-cloning-dialog.component";
import {ErrorDialogComponent} from "@app/components/error-dialog/error-dialog.component";
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';


import { ProcedureInstructionToolbarComponent } from './procedure-instruction-toolbar.component';

describe('ProcedureInstructionToolbarComponent', () => {
  let component: ProcedureInstructionToolbarComponent;
  let fixture: ComponentFixture<ProcedureInstructionToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureInstructionToolbarComponent,
        InstructioninfoAuthoringDialogComponent,
        InstructioninfoCloningDialogComponent,
        ErrorDialogComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureInstructionToolbarComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
