import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureHazardBannerComponent } from './procedure-hazard-banner.component';

describe('ProcedureHazardBannerComponent', () => {
  let component: ProcedureHazardBannerComponent;
  let fixture: ComponentFixture<ProcedureHazardBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcedureHazardBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureHazardBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
