import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleSelectionComponent } from './role-selection.component';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {LocalStorageService} from "@app/services/local-storage.service";
import {LocalStorageServiceMock} from "@app/services/local-storage.service.mock";
import {JL} from "jsnlog";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";
import {RoleService} from "@app/services/role.service";
import {programRoleMock} from "@app/test/program-role.mock";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RoleSelectionComponent', () => {
  let component: RoleSelectionComponent;
  let fixture: ComponentFixture<RoleSelectionComponent>;
  let roleService: RoleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [RoleSelectionComponent],
    imports: [MatSnackBarModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: 'JSNLog', useValue: JL },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleSelectionComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;

    roleService = TestBed.inject(RoleService);
    let roleServiceSpy = spyOn(roleService, 'syncGetAllRolesUserCanSign').and.returnValue(Promise.resolve(programRoleMock));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
