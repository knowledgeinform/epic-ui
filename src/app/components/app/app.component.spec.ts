import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import { AppTestingModule } from '@app/app-testing-module';
import { SwUpdateServiceMock } from '@app/services/sw-update.service.mock';
import { SwUpdate } from '@angular/service-worker';
import { AppService } from '@app/services/app.service';
import { Title } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let appService;
  let titleService;
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      providers: [
        { provide: SwUpdate, useClass: SwUpdateServiceMock },
        AppService,
        Title,
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      appService = fixture.debugElement.injector.get(AppService);
      titleService = fixture.debugElement.injector.get(Title);
      spyOn(appService, 'announcePageTitleChange').and.callThrough();
      spyOn(appService, 'announceBrowserTitleChange').and.callThrough();
      spyOn(component, 'setPageTitle').and.callThrough();
      spyOn(component, 'setTitle').and.callThrough();
      spyOn(titleService, 'setTitle');
      fixture.detectChanges();
    });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to app service and update page title', () => {
    const pageTitle = 'page title';
    appService.announcePageTitleChange(pageTitle);
    fixture.detectChanges();
    expect(component.setPageTitle).toHaveBeenCalledWith(pageTitle);
    expect(component.pageTitle).toEqual(pageTitle);
  });

  it('should subscribe to app service and update browser title', () => {
    const browserTitle = 'browser title';
    appService.announceBrowserTitleChange(browserTitle);
    fixture.detectChanges();
    expect(component.setTitle).toHaveBeenCalledWith(browserTitle);
    expect(titleService.setTitle).toHaveBeenCalledWith(browserTitle);
  });
});
