import { provideHttpClientTesting } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/app-material/app-material.module';
import { AppTestingModule } from '@app/app-testing-module';
import { LocalStorageServiceMock } from '@app/services/local-storage.service.mock';
import { LocalStorageService } from '@app/services/local-storage.service';

import { RosterEntryComponent } from './roster-entry.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RosterEntryComponent', () => {
  let component: RosterEntryComponent;
  let fixture: ComponentFixture<RosterEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RosterEntryComponent],
    imports: [AppTestingModule,
        AppMaterialModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
