import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedureTransitionReleaseComponent} from './procedure-transition-release.component';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';

describe('ProcedureTransitionReleaseComponent', () => {
  let component: ProcedureTransitionReleaseComponent;
  let fixture: ComponentFixture<ProcedureTransitionReleaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedureTransitionReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureTransitionReleaseComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
