import { provideHttpClientTesting } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { AppConfigService } from '@app/services/app-config-service.service';
import { AppConfigServiceMock } from '@app/services/app-config.service.mock';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { LocalStorageService } from '@app/services/local-storage.service';
import { EditProgramRolesAndChangeTypesComponent } from './edit-program-roles-and-change-types.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('EditProgramRolesAndChangeTypesComponent', () => {
  let component: EditProgramRolesAndChangeTypesComponent;
  let fixture: ComponentFixture<EditProgramRolesAndChangeTypesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        EditProgramRolesAndChangeTypesComponent,
    ],
    imports: [AppTestingModule,
        AppMaterialModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: AppConfigService, useClass: AppConfigServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProgramRolesAndChangeTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
