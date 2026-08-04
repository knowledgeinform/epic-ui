import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovedefinitionComponent } from './movedefinition.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('MovedefinitionComponent', () => {
  let component: MovedefinitionComponent;
  let fixture: ComponentFixture<MovedefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ MovedefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovedefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
