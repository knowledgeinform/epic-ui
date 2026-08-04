import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchSidenavComponent } from './global-search-sidenav.component';

import {AppTestingModule} from "@app/app-testing-module";

describe('GlobalSearchSidenavComponent', () => {
  let component: GlobalSearchSidenavComponent;
  let fixture: ComponentFixture<GlobalSearchSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalSearchSidenavComponent ],
      imports: [ AppTestingModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
