import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxEsd0Component } from './checkbox-esd0.component';
import { AppTestingModule } from '@app/app-testing-module';
import { IconEsd0Component } from '../icon-esd0/icon-esd0.component';

describe('CheckboxEsd0Component', () => {
  let component: CheckboxEsd0Component;
  let fixture: ComponentFixture<CheckboxEsd0Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxEsd0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
