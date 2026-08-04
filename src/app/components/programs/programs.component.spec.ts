import { provideHttpClientTesting } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { OfflineService } from '@app/services/offline.service';
import { LocalStorageService } from '@app/services/local-storage.service';
import { OfflineServiceMock } from '@app/test/offline-service.mock';
import { ProgramsComponent } from './programs.component';
import { AppConfigServiceMock } from '@app/services/app-config.service.mock';
import { AppConfigService } from '@app/services/app-config-service.service';
import { AppTestingModule } from '@app/app-testing-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProgramsComponent', () => {
  let component: ProgramsComponent;
  let fixture: ComponentFixture<ProgramsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ProgramsComponent],
    imports: [AppTestingModule,
        AppMaterialModule,
        RouterTestingModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: OfflineService, useClass: OfflineServiceMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
