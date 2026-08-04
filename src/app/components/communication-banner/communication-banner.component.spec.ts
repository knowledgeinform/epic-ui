import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EPICWSService } from '@app/services/epic-ws.service';

import { CommunicationBannerComponent } from './communication-banner.component';

describe('CommunicationBannerComponent', () => {
  let component: CommunicationBannerComponent;
  let fixture: ComponentFixture<CommunicationBannerComponent>;
  const epicWsServiceMock = {
    getCommunicationBanner: jasmine.createSpy('getCommunicationBanner').and.returnValue(of(undefined))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationBannerComponent ],
      providers: [{ provide: EPICWSService, useValue: epicWsServiceMock }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommunicationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
