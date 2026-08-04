import {waitForAsync, ComponentFixture, inject, TestBed} from '@angular/core/testing';

import { ProceduresearchComponent } from './proceduresearch.component';
import { AppTestingModule } from '@app/app-testing-module';
import {LoggerService} from '@app/services/logger.service';

describe('ProceduresearchComponent', () => {
  let component: ProceduresearchComponent;
  let fixture: ComponentFixture<ProceduresearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProceduresearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduresearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
