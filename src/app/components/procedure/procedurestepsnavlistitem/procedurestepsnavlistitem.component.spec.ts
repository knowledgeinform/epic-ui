import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedurestepsnavlistitemComponent } from './procedurestepsnavlistitem.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('ProcedurestepsnavlistitemComponent', () => {
  let component: ProcedurestepsnavlistitemComponent;
  let fixture: ComponentFixture<ProcedurestepsnavlistitemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ ProcedurestepsnavlistitemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedurestepsnavlistitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
