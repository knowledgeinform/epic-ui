import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedureTransitionComponent} from './procedure-transition.component';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';

describe('ProcedureTransitionComponent', () => {
  let component: ProcedureTransitionComponent;
  let fixture: ComponentFixture<ProcedureTransitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedureTransitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureTransitionComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
