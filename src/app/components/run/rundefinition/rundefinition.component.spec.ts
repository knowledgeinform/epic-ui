import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RundefinitionComponent } from './rundefinition.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('RundefinitionComponent', () => {
  let component: RundefinitionComponent;
  let fixture: ComponentFixture<RundefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ RundefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RundefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
