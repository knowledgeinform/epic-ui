import { NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from './app-material/app-material.module';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LocalStorageServiceMock } from './services/local-storage.service.mock';
import { AppConfigService } from './services/app-config-service.service';
import { AppConfigServiceMock } from '@app/services/app-config.service.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {JL} from 'jsnlog';
import {LoggerService} from '@app/services/logger.service';
import {LoggerServiceMock} from '@app/services/logger.service.mock';
import { AppPipesModule } from './app-material/app-pipes.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxSummernoteModule} from "ngx-summernote";

const globalImports = [
  FormsModule,
  AppMaterialModule,
  AppPipesModule,
  RouterTestingModule,
  BrowserAnimationsModule,
  NgxSummernoteModule,
];

const globalDeclarations = [
];

/**
 * This module contains all dependencies that should be imported for all tests. For convenience, place commonly-used dependencies here.
 *
 * Pipes & components should go in the `globalDeclarations` array, while modules should go in the `globalImports` array.
 */
@NgModule({
  imports: globalImports,
  exports: globalImports,
  declarations: globalDeclarations,
  providers: [
    { provide: LocalStorageService, useClass: LocalStorageServiceMock },
    { provide: AppConfigService, useClass: AppConfigServiceMock },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: 'JSNLog', useValue: JL},
    { provide: LoggerService, useClass: LoggerServiceMock},
    provideHttpClient(),
    provideHttpClientTesting(),
  ]
})
export class AppTestingModule {
}

