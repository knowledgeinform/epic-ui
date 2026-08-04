import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { CreateProgramComponent } from './create-program/create-program.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CreateSubsystemComponent } from './create-subsystem/create-subsystem.component';
import { CreateTestingPhaseComponent } from './create-testing-phase/create-testing-phase.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '@app/services/app-config-service.service';
import { OfflineService } from '@app/services/offline.service';
import { EditProgramRolesAndChangeTypesComponent } from './edit-program-roles-and-change-types/edit-program-roles-and-change-types.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OfflineServiceMock } from '@app/test/offline-service.mock';
import { ActivatedRouteMock } from '@app/test/activated-route.mock';
import { AppTestingModule } from '@app/app-testing-module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        AdminComponent,
        CreateProgramComponent,
        CreateUserComponent,
        CreateSubsystemComponent,
        CreateTestingPhaseComponent,
        EditUserComponent,
        EditProgramRolesAndChangeTypesComponent,
    ],
    imports: [AppTestingModule,
        AppMaterialModule,
        RouterTestingModule],
    providers: [
        AppConfigService,
        { provide: OfflineService, useClass: OfflineServiceMock },
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
