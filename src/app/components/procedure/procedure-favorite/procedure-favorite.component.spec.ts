import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedureFavoriteComponent} from './procedure-favorite.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('ProcedureFavoriteComponent', () => {
  let component: ProcedureFavoriteComponent;
  let fixture: ComponentFixture<ProcedureFavoriteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedureFavoriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureFavoriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
