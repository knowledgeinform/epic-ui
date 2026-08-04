import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { EPICWSService } from '@app/services/epic-ws.service';

import { CommunicationBannerConfigComponent } from './communication-banner-config.component';

describe('CommunicationBannerComponent', () => {
  let component: CommunicationBannerConfigComponent;
  let fixture: ComponentFixture<CommunicationBannerConfigComponent>;
  const epicWsServiceMock = {
    getCommunicationBanner: jasmine.createSpy('getCommunicationBanner').and.returnValue(of(undefined)),
    postCommunicationBanner: jasmine.createSpy('postCommunicationBanner').and.returnValue(Promise.resolve(undefined)),
    removeCommunicationBanner: jasmine.createSpy('removeCommunicationBanner').and.returnValue(Promise.resolve(undefined))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationBannerConfigComponent ],
      providers: [{ provide: EPICWSService, useValue: epicWsServiceMock }],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommunicationBannerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
