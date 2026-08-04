import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';
import { CheckboxEsd0Component } from '@app/components/checkbox-esd0/checkbox-esd0.component';
import { GenericCommentHistoryDisplayComponent } from '@app/components/generic-comment-history-display/generic-comment-history-display.component';
import { IconEsd0Component } from '@app/components/icon-esd0/icon-esd0.component';
import { StatusHistoryComponent } from '@app/components/procedure/status-history/status-history.component';
import { ImageDisplayComponentComponent } from '@app/components/uploadFile/image-display-component/image-display-component.component';
import { UploadFileComponentComponent } from '@app/components/uploadFile/upload-file-component/upload-file-component.component';
import { AgGridModule } from 'ag-grid-angular';
import { ProcedureFavoriteComponent } from '../../procedure-favorite/procedure-favorite.component';
import { ProcedureHazardBannerComponent } from '../../procedure-hazard-banner/procedure-hazard-banner.component';
import { ProcedureHazardComponent } from '../../procedure-hazard/procedure-hazard.component';
import { ProcedureInstructionInfoContainerComponent } from '../../instructions/procedure-instruction-info-container/procedure-instruction-info-container.component';
import { ProcedureStepGroupPrintableComponent } from '../../procedure-step-group-printable/procedure-step-group-printable.component';
import { ProcedureStepPrintableComponent } from '../../procedure-step-printable/procedure-step-printable.component';
import { ProcedureheaderComponent } from '../../procedureheader/procedureheader.component';
import { ProcedureinstructioninfoComponent } from '../../instructions/procedureinstructioninfo/procedureinstructioninfo.component';
import { ProcedureRunPrintEquipmentTableComponent } from './procedure-run-print-equipment-table/procedure-run-print-equipment-table.component';
import { ProcedureRunPrintComponent } from './procedure-run-print.component';
import {SummernoteEditorComponent} from "@app/components/summernote-editor/summernote-editor.component";
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";


describe('ProcedureRunPrintComponent', () => {
  let component: ProcedureRunPrintComponent;
  let fixture: ComponentFixture<ProcedureRunPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
        AgGridModule,
      ],
      declarations: [
        ProcedureRunPrintComponent,
        ProcedureHazardBannerComponent,
        ProcedureHazardComponent,
        ProcedureheaderComponent,
        ProcedureInstructionInfoContainerComponent,
        ProcedureinstructioninfoComponent,
        UploadFileComponentComponent,
        ProcedureRunPrintEquipmentTableComponent,
        ProcedureStepGroupPrintableComponent,
        CheckboxEsd0Component,
        ProcedureFavoriteComponent,
        ImageDisplayComponentComponent,
        ProcedureStepPrintableComponent,
        IconEsd0Component,
        GenericCommentHistoryDisplayComponent,
        StatusHistoryComponent,
        SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureRunPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
