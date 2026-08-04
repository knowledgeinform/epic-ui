import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgramComponent } from './create-program.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('CreateProgramComponent', () => {
  let component: CreateProgramComponent;
  let fixture: ComponentFixture<CreateProgramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProgramComponent ],
      imports: [ AppTestingModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
