import { provideHttpClientTesting } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { EditProgramRolesAndChangeTypesComponent } from '@app/components/admin/edit-program-roles-and-change-types/edit-program-roles-and-change-types.component';
import { AppConfigService } from '@app/services/app-config-service.service';
import { AppConfigServiceMock } from '@app/services/app-config.service.mock';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { ActivatedRouteMock } from '@app/test/activated-route.mock';
import { LocalStorageService } from '@app/services/local-storage.service';
import { ProgramComponent } from './program.component';
import { RosterEntryComponent } from './roster-entry/roster-entry.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('ProgramComponent', () => {
  let component: ProgramComponent;
  let fixture: ComponentFixture<ProgramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        ProgramComponent,
        RosterEntryComponent,
        EditProgramRolesAndChangeTypesComponent,
    ],
    imports: [AppTestingModule,
        AppMaterialModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
