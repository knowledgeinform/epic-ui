import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunStartDialogComponent } from './run-start-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProceduresearchComponent } from '@app/components/procedure/proceduresearch/proceduresearch.component';
import { RundefinitionComponent } from '../rundefinition/rundefinition.component';

describe('RunStartDialogComponent', () => {
  let component: RunStartDialogComponent;
  let fixture: ComponentFixture<RunStartDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        RunStartDialogComponent,
        ProceduresearchComponent,
        RundefinitionComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunStartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
