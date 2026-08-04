import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';

import { MultiSelectGroupsStepsComponent } from './multi-select-groups-steps.component';

describe('MultiSelectGroupsStepsComponent', () => {
  let component: MultiSelectGroupsStepsComponent;
  let fixture: ComponentFixture<MultiSelectGroupsStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ MultiSelectGroupsStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectGroupsStepsComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
