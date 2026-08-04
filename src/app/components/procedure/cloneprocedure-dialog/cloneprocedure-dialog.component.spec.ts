import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneprocedureDialogComponent } from './cloneprocedure-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProceduresearchComponent } from '../proceduresearch/proceduresearch.component';
import { ProceduredefinitionComponent } from '../proceduredefinition/proceduredefinition.component';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';

describe('CloneprocedureDialogComponent', () => {
  let component: CloneprocedureDialogComponent;
  let fixture: ComponentFixture<CloneprocedureDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        CloneprocedureDialogComponent,
        ProceduresearchComponent,
        ProceduredefinitionComponent,
        ProceduredefinitionComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneprocedureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
