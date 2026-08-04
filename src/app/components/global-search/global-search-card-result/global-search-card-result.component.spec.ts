import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchCardResultComponent } from './global-search-card-result.component';
import {AppTestingModule} from "@app/app-testing-module";
import {ProcedureDescriptionPipe} from "@app/pipes/procedure-description-pipe";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";

describe('GlobalSearchCardResultComponent', () => {
  let component: GlobalSearchCardResultComponent;
  let fixture: ComponentFixture<GlobalSearchCardResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalSearchCardResultComponent, ProcedureDescriptionPipe  ],
      imports: [ AppTestingModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchCardResultComponent);
    component = fixture.componentInstance;
    component.procedureDetails = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
