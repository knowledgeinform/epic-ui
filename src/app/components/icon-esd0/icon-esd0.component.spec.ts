import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconEsd0Component } from './icon-esd0.component';
import { AppTestingModule } from '@app/app-testing-module';

describe('IconEsd0Component', () => {
  let component: IconEsd0Component;
  let fixture: ComponentFixture<IconEsd0Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ IconEsd0Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconEsd0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
