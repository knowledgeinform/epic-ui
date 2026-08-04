import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramExportDownloadComponent } from './program-export-download.component';
import {AppTestingModule} from "@app/app-testing-module";
import {AppMaterialModule} from "@app/app-material/app-material.module";
import {RouterTestingModule} from "@angular/router/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProgramExportDownloadComponent', () => {
  let component: ProgramExportDownloadComponent;
  let fixture: ComponentFixture<ProgramExportDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ProgramExportDownloadComponent],
    imports: [AppTestingModule,
        AppMaterialModule,
        RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramExportDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
