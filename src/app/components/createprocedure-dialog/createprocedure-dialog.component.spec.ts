import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateprocedureDialogComponent} from './createprocedure-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProceduredefinitionComponent } from '../procedure/proceduredefinition/proceduredefinition.component';
import { CheckboxEsd0Component } from '../checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '../icon-esd0/icon-esd0.component';

describe('CreateprocedureDialogComponent', () => {
  let component: CreateprocedureDialogComponent;
  let fixture: ComponentFixture<CreateprocedureDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        CreateprocedureDialogComponent,
        ProceduredefinitionComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateprocedureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
