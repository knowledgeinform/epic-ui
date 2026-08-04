import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { StatusHistoryComponent } from '@app/components/procedure/status-history/status-history.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { procedureDetailsLockedRunMock } from '@app/test/procedure-details.mock';
import { ProcedureFavoriteComponent } from '../procedure-favorite/procedure-favorite.component';
import { ProcedureheaderComponent } from './procedureheader.component';
import {CanEditApproversPipe} from "@app/pipes/can-edit-approvers.pipe";
import {ApproverChipDisabledTooltipPipe} from "@app/pipes/approver-chip-disabled-tooltip.pipe";
import {ApproverChipTooltipPipe} from "@app/pipes/approver-chip-tooltip.pipe";
import { AppComponent } from '@app/components/app/app.component';



describe('ProcedureheaderComponent', () => {
  let component: ProcedureheaderComponent;
  let fixture: ComponentFixture<ProcedureheaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        ProcedureheaderComponent,
        ProcedureFavoriteComponent,
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
        GenericCommentHistoryDisplayComponent,
        StatusHistoryComponent,
        ApproverChipDisabledTooltipPipe,
        ApproverChipTooltipPipe,
        CanEditApproversPipe,
      ],
      providers: [
        {provide: AppComponent, useValue: {}},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureheaderComponent);
    component = fixture.componentInstance;
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
