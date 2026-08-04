import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchCardRunResultComponent } from './global-search-card-run-result.component';
import {AppTestingModule} from "@app/app-testing-module";
import {ProcedureDescriptionPipe} from "@app/pipes/procedure-description-pipe";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";
import {runMock} from "@app/test/run.mock";
import {procedureDefMock} from "@app/test/procedure-def.mock";
import {testingPhaseMock} from "@app/test/testing-phase.mock";

describe('GlobalSearchCardRunResultComponent', () => {
  let component: GlobalSearchCardRunResultComponent;
  let fixture: ComponentFixture<GlobalSearchCardRunResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalSearchCardRunResultComponent, ProcedureDescriptionPipe ],
      imports: [ AppTestingModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchCardRunResultComponent);
    component = fixture.componentInstance;
    component.procedureDetails = procedureDetailsLockedRunMock;
    component.procedureDetails.procedureDef = procedureDefMock;
    component.procedureDetails.run = runMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
