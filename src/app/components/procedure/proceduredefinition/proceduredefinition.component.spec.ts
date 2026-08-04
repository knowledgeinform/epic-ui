import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProceduredefinitionComponent } from './proceduredefinition.component';
import { AppTestingModule } from '@app/app-testing-module';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';

describe('ProceduredefinitionComponent', () => {
  let component: ProceduredefinitionComponent;
  let fixture: ComponentFixture<ProceduredefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProceduredefinitionComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduredefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
