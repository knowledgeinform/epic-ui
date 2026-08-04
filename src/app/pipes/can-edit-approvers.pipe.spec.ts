import { CanEditApproversPipe } from './can-edit-approvers.pipe';
import {LoginService} from "@app/services/login.service";
import {TestBed} from "@angular/core/testing";
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {LocalStorageService} from "@app/services/local-storage.service";
import {LocalStorageServiceMock} from "@app/services/local-storage.service.mock";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CanEditApproversPipe', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}));

  it('create an instance', () => {
    const service: LoginService = TestBed.inject(LoginService);
    const pipe = new CanEditApproversPipe(service);
    expect(pipe).toBeTruthy();
  });
});
