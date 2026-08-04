import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconMenuButtonComponent } from './icon-menu-button.component';

describe('IconMenuButtonComponent', () => {
  let component: IconMenuButtonComponent;
  let fixture: ComponentFixture<IconMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconMenuButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
