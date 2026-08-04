import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GlobalSearchInfiniteScrollComponent } from './global-search-infinite-scroll.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {LocalStorageService} from "@app/services/local-storage.service";
import {LocalStorageServiceMock} from "@app/services/local-storage.service.mock";
import {JL} from "jsnlog";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {RouterTestingModule} from "@angular/router/testing";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GlobalSearchInfiniteScrollComponent', () => {
  let component: GlobalSearchInfiniteScrollComponent;
  let fixture: ComponentFixture<GlobalSearchInfiniteScrollComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GlobalSearchInfiniteScrollComponent],
    imports: [MatSnackBarModule, InfiniteScrollModule,
        RouterTestingModule, MatDialogModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: 'JSNLog', useValue: JL },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {
                close: () => { },
            } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchInfiniteScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
