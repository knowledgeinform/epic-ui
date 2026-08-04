import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {InViewportDirective} from './directives/in-viewport.directive';

import { LOCAL_STORAGE_CONFIG } from './services/local-storage.config';

import {AppMaterialModule} from './app-material/app-material.module';

import {AppComponent} from './components/app/app.component';
import {DashboardComponent} from '@app/components/dashboard/dashboard.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {EPICWSService} from './services/epic-ws.service';
import {MydraftsComponent} from './components/dashboard/mydrafts/mydrafts.component';
import {MyrunsComponent} from './components/dashboard/myruns/myruns.component';
import {MyapprovalsComponent} from './components/dashboard/myapprovals/myapprovals.component';
import {CreateprocedureDialogComponent} from './components/createprocedure-dialog/createprocedure-dialog.component';
import {AuthorprocedureComponent} from './components/procedure/authorprocedure/authorprocedure.component';
import {ProcedureheaderComponent} from './components/procedure/procedureheader/procedureheader.component';
import {ProcedureinstructioninfoComponent} from './components/procedure/instructions/procedureinstructioninfo/procedureinstructioninfo.component';
import {ProcedurestepsComponent} from './components/procedure/proceduresteps/proceduresteps.component';
import {SingleAutocompleteDialogComponent} from './components/single-autocomplete-dialog/single-autocomplete-dialog.component';
import {InstructioninfoAuthoringDialogComponent} from './components/procedure/instructions/instructioninfo-authoring-dialog/instructioninfo-authoring-dialog.component';
import {ErrorDialogComponent} from './components/error-dialog/error-dialog.component';
import {StepgroupAuthoringDialogComponent} from './components/step-group/stepgroup-authoring-dialog/stepgroup-authoring-dialog.component';
import {StepAuthoringDialogComponent} from './components/step/step-authoring-dialog/step-authoring-dialog.component';
import {ProceduresearchComponent} from './components/procedure/proceduresearch/proceduresearch.component';
import {CloneprocedureDialogComponent} from '@app/components/procedure/cloneprocedure-dialog/cloneprocedure-dialog.component';
import {ProceduredefinitionComponent} from './components/procedure/proceduredefinition/proceduredefinition.component';
import {ProcedurestepscontainerComponent} from './components/procedure/procedurestepscontainer/procedurestepscontainer.component';
import {ProcedurestepgroupsComponent} from './components/procedure/procedurestepgroups/procedurestepgroups.component';
import {ProcedurestepsnavlistitemComponent} from './components/procedure/procedurestepsnavlistitem/procedurestepsnavlistitem.component';
import {TablestepentryComponent} from './components/step/tablestepentry/tablestepentry.component';
import {LoginComponent} from './components/login/login.component';
import {JwtInterceptor} from './jwt-interceptor';
import {LoginService} from './services/login.service';
import {AuthGuard} from './auth.guard';
import {ErrorInterceptor} from './error-interceptor';
import {ProcedureTransitionComponent} from './components/procedure/procedure-transition/procedure-transition.component';
import {StepgroupMoveDialogComponent} from './components/step-group/stepgroup-move-dialog/stepgroup-move-dialog.component';
import {StepgroupDeleteDialogComponent} from './components/step-group/stepgroup-delete-dialog/stepgroup-delete-dialog.component';
import {ProcedureApprovalCommentDisplayComponent} from './components/procedure/procedure-approval-comment-display/procedure-approval-comment-display.component';
import {ProcedureApprovalCommentComponent} from './components/procedure/procedure-approval-comment/procedure-approval-comment.component';
import {StepdefinitionComponent} from './components/step/stepdefinition/stepdefinition.component';
import {ApproverActionComponent} from './components/procedure/approver-action/approver-action.component';
import {ProcedureTransitionReleaseComponent} from './components/procedure/procedure-transition-release/procedure-transition-release.component';
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {StepEditingDialogComponent} from './components/step/step-editing-dialog/step-editing-dialog.component';
import {MovedefinitionComponent} from './components/movedefinition/movedefinition.component';
import {StepMovingDialogComponent} from './components/step/step-moving-dialog/step-moving-dialog.component';
import {StepDeletingDialogComponent} from './components/step/step-deleting-dialog/step-deleting-dialog.component';
import {RunStartDialogComponent} from './components/run/run-start-dialog/run-start-dialog.component';
import {RundefinitionComponent} from '@app/components/run/rundefinition/rundefinition.component';
import {ProcedureRunComponent} from './components/procedure/procedure-run/procedure-run.component';
import {ContenteditableModel} from './components/contenteditable-model/contenteditable-model.component';
import {RunstepcommentComponent} from './components/run/runstepcomment/runstepcomment.component';
import {ProcedureRunEquipmentEntryComponent} from './components/procedure/procedure-run/procedure-run-equipment-entry/procedure-run-equipment-entry.component';
import {BlacklineComponent} from './components/blackline/blackline.component';
import {ManualStepValidationDialogComponent} from './components/manual-step-validation-dialog/manual-step-validation-dialog.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {PinChangeComponent} from './components/user-profile/pin-change/pin-change.component';
import {NewPinDialogComponent} from './components/user-profile/new-pin-dialog/new-pin-dialog.component';
import {OfflineAvailabilityIndicatorComponent} from './components/offline-availability-indicator/offline-availability-indicator.component';
import {ProcedureRunPrintComponent} from './components/procedure/procedure-run/procedure-run-print/procedure-run-print.component';
import {ProcedureFavoriteComponent} from './components/procedure/procedure-favorite/procedure-favorite.component';
import {ProcedureInstructionInfoContainerComponent} from './components/procedure/instructions/procedure-instruction-info-container/procedure-instruction-info-container.component';
import {RedBlackLineCommentDialogComponent} from './components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {LineEditCommentsComponent} from './components/line-edit-comments/line-edit-comments.component';
import {AdminComponent} from './components/admin/admin.component';
import {CreateProgramComponent} from './components/admin/create-program/create-program.component';
import {CreateUserComponent} from './components/admin/create-user/create-user.component';
import {CreateSubsystemComponent} from './components/admin/create-subsystem/create-subsystem.component';
import {CreateTestingPhaseComponent} from './components/admin/create-testing-phase/create-testing-phase.component';
import {AppConfigService} from '@app/services/app-config-service.service';
import {EditUserComponent} from './components/admin/edit-user/edit-user.component';
import {StepCopyDialogComponent} from './components/step/step-copy-dialog/step-copy-dialog.component';
import {StepgroupCopyDialogComponent} from './components/step-group/stepgroup-copy-dialog/stepgroup-copy-dialog.component';
import {ProcedureRunPreviewComponent} from './components/procedure/procedure-run-preview/procedure-run-preview.component';
import {RedBlackLineCommentComponent} from './components/red-black-line-comment/red-black-line-comment.component';
import {EquipmentEntryItemComponent} from './components/procedure/procedure-run/procedure-run-equipment-entry/equipment-entry-item/equipment-entry-item.component';
import {StepCloneDialogComponent} from './components/step/step-clone-dialog/step-clone-dialog.component';
import {CheckboxEsd0Component} from './components/checkbox-esd0/checkbox-esd0.component';
import {IconEsd0Component} from './components/icon-esd0/icon-esd0.component';
import {InstructioninfoCloningDialogComponent} from './components/procedure/instructions/instructioninfo-cloning-dialog/instructioninfo-cloning-dialog.component';
import {ProcedureHazardComponent} from './components/procedure/procedure-hazard/procedure-hazard.component';
import {UploadFileComponentComponent} from './components/uploadFile/upload-file-component/upload-file-component.component';
import {DragDropDirectiveDirective} from '@app/components/uploadFile/upload-file-component/drag-drop-directive.directive';
import {ImageDisplayComponentComponent} from './components/uploadFile/image-display-component/image-display-component.component';
import {LineEditBulkSignDialogComponent} from './components/line-edit-bulk-sign-dialog/line-edit-bulk-sign-dialog.component';
import {RunCloseoutSubmissionComponent} from './components/run/run-closeout/run-closeout-submission/run-closeout-submission.component';
import {RunCloseoutContainerComponent} from './components/run/run-closeout/run-closeout-container/run-closeout-container.component';
import {AppUpdateService} from './services/app-update.service';
import {ProcedureStepGroupPrintableComponent} from './components/procedure/procedure-step-group-printable/procedure-step-group-printable.component';
import {ProcedureStepPrintableComponent} from './components/procedure/procedure-step-printable/procedure-step-printable.component';
import {ProcedureHazardBannerComponent} from './components/procedure/procedure-hazard-banner/procedure-hazard-banner.component';
import {ProcedureRunPrintEquipmentTableComponent} from './components/procedure/procedure-run/procedure-run-print/procedure-run-print-equipment-table/procedure-run-print-equipment-table.component';
import {RunSummaryComponent} from './components/run/run-summary/run-summary.component';
import {RunApproverCommentDisplayComponent} from './components/run/run-closeout/run-approver/run-approver-comment-display/run-approver-comment-display.component';
import {RunApproverCommentComponent} from './components/run/run-closeout/run-approver/run-approver-comment/run-approver-comment.component';
import {RunCloseoutReviewingComponent} from './components/run/run-closeout/run-closeout-reviewing/run-closeout-reviewing.component';
import {RunCloseoutCompletedComponent} from './components/run/run-closeout/run-closeout-completed/run-closeout-completed.component';
import {StepChangeTypeDialogComponent} from './components/step/step-change-type-dialog/step-change-type-dialog.component';
import {RunCloseoutStickyCommentComponent} from './components/run/run-closeout/run-closeout-sticky-comment/run-closeout-sticky-comment.component';
import {RunCloseoutStickyCommentSummaryComponent} from './components/run/run-closeout/run-closeout-sticky-comment-summary/run-closeout-sticky-comment-summary.component';
import {AgGridModule} from 'ag-grid-angular';
import { ReportingProcedureStatusComponent } from './components/reporting/reporting-procedure-status/reporting-procedure-status.component';
import { ReportingContainerComponent } from './components/reporting/reporting-container/reporting-container.component';
import { ReportingRunStatusComponent } from './components/reporting/reporting-run-status/reporting-run-status.component';
import { ReportingEquipmentListComponent } from './components/reporting/reporting-equipment-list/reporting-equipment-list.component';
import { ReportingCommonComponent } from './components/reporting/reporting-common/reporting-common.component';
import { GenericCommentHistoryDisplayComponent } from './components/generic-comment-history-display/generic-comment-history-display.component';
import { RosterEntryComponent } from './components/programs/program/roster-entry/roster-entry.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { ProgramComponent } from './components/programs/program/program.component';
import { EditProgramRolesAndChangeTypesComponent } from './components/admin/edit-program-roles-and-change-types/edit-program-roles-and-change-types.component';
import { ProcedureChangeTypeService } from './services/procedure-change-type.service';
import { RoleService } from './services/role.service';
import { SignCommentComponent } from './components/line-edit-comments/sign-comment/sign-comment.component';
import { EditRequiredRolesDialogComponent } from './components/programs/program/edit-required-roles-dialog/edit-required-roles-dialog.component';
import {JL} from 'jsnlog';
import {LoggerService} from '@app/services/logger.service';
import { AppPipesModule } from './app-material/app-pipes.module';
import { StatusHistoryComponent } from './components/procedure/status-history/status-history.component';
import { CommentChangeTypeSelectComponent } from './components/comment-change-type-select/comment-change-type-select.component';
import { IconMenuButtonComponent } from './components/icon-menu-button/icon-menu-button.component';

import { NgxSummernoteModule } from 'ngx-summernote';
import { SummernoteEditorComponent } from './components/summernote-editor/summernote-editor.component';
import { ProcedureInstructionToolbarComponent } from './components/procedure/instructions/procedure-instruction-toolbar/procedure-instruction-toolbar.component';
import { ProcedureStepsToolbarComponent } from './components/procedure/procedure-steps-toolbar/procedure-steps-toolbar.component';
import { ProgramExportDownloadComponent } from './components/program-export-download/program-export-download.component';
import { GlobalSearchSidenavComponent } from './components/global-search/global-search-sidenav/global-search-sidenav.component';
import { GlobalSearchCardResultComponent } from './components/global-search/global-search-card-result/global-search-card-result.component';
import { GlobalSearchCardRunResultComponent } from './components/global-search/global-search-card-run-result/global-search-card-run-result.component';
import { GlobalSearchInfiniteScrollComponent } from './components/global-search/global-search-infinite-scroll/global-search-infinite-scroll.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BulkValidateDialogComponent } from './components/bulk-validate-dialog/bulk-validate-dialog.component';
import { MultiSelectGroupsStepsComponent } from './components/multi-select-groups-steps/multi-select-groups-steps.component';
import { BulkSignDialogComponent } from './components/bulk-sign-dialog/bulk-sign-dialog.component';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { CommunicationBannerConfigComponent } from '@app/components/admin/communication-banner-config/communication-banner-config.component';
import { CommunicationBannerComponent } from './components/communication-banner/communication-banner.component';
import {OverlayModule} from "@angular/cdk/overlay";
import { SpinnerComponent } from './components/spinner/spinner.component';
import {
  EquipmentEntryItemDialogComponent
} from "@app/components/procedure/procedure-run/procedure-run-equipment-entry/equipment-entry-item-dialog/equipment-entry-item-dialog.component";
import { MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS } from '@angular/material/button-toggle';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { ENTER } from '@angular/cdk/keycodes';

export function initializeConfig(appConfigService: AppConfigService) {
  return () => appConfigService.loadConfig();
}

@NgModule({ exports: [
        AppMaterialModule,
    ],
    declarations: [
        ContenteditableModel,
        AppComponent,
        DashboardComponent,
        MydraftsComponent,
        MyrunsComponent,
        MyapprovalsComponent,
        CreateprocedureDialogComponent,
        AuthorprocedureComponent,
        ProcedureheaderComponent,
        ProcedureinstructioninfoComponent,
        ProcedurestepsComponent,
        SingleAutocompleteDialogComponent,
        ProceduresearchComponent,
        CloneprocedureDialogComponent,
        InstructioninfoAuthoringDialogComponent,
        ErrorDialogComponent,
        StepgroupAuthoringDialogComponent,
        StepAuthoringDialogComponent,
        ProceduredefinitionComponent,
        ProcedurestepscontainerComponent,
        ProcedurestepgroupsComponent,
        ProcedurestepsnavlistitemComponent,
        TablestepentryComponent,
        LoginComponent,
        ProcedureTransitionComponent,
        StepgroupMoveDialogComponent,
        StepgroupDeleteDialogComponent,
        ProcedureApprovalCommentDisplayComponent,
        ProcedureApprovalCommentComponent,
        StepdefinitionComponent,
        ApproverActionComponent,
        ProcedureTransitionReleaseComponent,
        ConfirmationDialogComponent,
        StepEditingDialogComponent,
        MovedefinitionComponent,
        StepMovingDialogComponent,
        StepDeletingDialogComponent,
        RunStartDialogComponent,
        RundefinitionComponent,
        ProcedureRunComponent,
        RunstepcommentComponent,
        ProcedureRunEquipmentEntryComponent,
        BlacklineComponent,
        ManualStepValidationDialogComponent,
        UserProfileComponent,
        PinChangeComponent,
        NewPinDialogComponent,
        OfflineAvailabilityIndicatorComponent,
        ProcedureRunPrintComponent,
        ProcedureFavoriteComponent,
        ProcedureInstructionInfoContainerComponent,
        RedBlackLineCommentDialogComponent,
        LineEditCommentsComponent,
        AdminComponent,
        CreateProgramComponent,
        CreateUserComponent,
        CreateSubsystemComponent,
        CreateTestingPhaseComponent,
        EditUserComponent,
        StepCopyDialogComponent,
        StepgroupCopyDialogComponent,
        ProcedureRunPreviewComponent,
        RedBlackLineCommentComponent,
        EquipmentEntryItemComponent,
        StepCloneDialogComponent,
        CheckboxEsd0Component,
        IconEsd0Component,
        InstructioninfoCloningDialogComponent,
        ProcedureHazardComponent,
        LineEditBulkSignDialogComponent,
        DragDropDirectiveDirective,
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
        RunCloseoutSubmissionComponent,
        RunCloseoutContainerComponent,
        ProcedureStepGroupPrintableComponent,
        ProcedureStepPrintableComponent,
        ProcedureHazardBannerComponent,
        ProcedureRunPrintEquipmentTableComponent,
        RunSummaryComponent,
        RunApproverCommentDisplayComponent,
        RunApproverCommentComponent,
        RunCloseoutReviewingComponent,
        RunCloseoutCompletedComponent,
        StepChangeTypeDialogComponent,
        RunCloseoutStickyCommentComponent,
        RunCloseoutStickyCommentSummaryComponent,
        ReportingProcedureStatusComponent,
        ReportingContainerComponent,
        ReportingRunStatusComponent,
        ReportingEquipmentListComponent,
        ReportingCommonComponent,
        GenericCommentHistoryDisplayComponent,
        RosterEntryComponent,
        ProgramsComponent,
        ProgramComponent,
        EditProgramRolesAndChangeTypesComponent,
        SignCommentComponent,
        EditRequiredRolesDialogComponent,
        StatusHistoryComponent,
        CommentChangeTypeSelectComponent,
        IconMenuButtonComponent,
        SummernoteEditorComponent,
        ProcedureInstructionToolbarComponent,
        ProcedureStepsToolbarComponent,
        ProgramExportDownloadComponent,
        GlobalSearchSidenavComponent,
        GlobalSearchCardResultComponent,
        GlobalSearchCardRunResultComponent,
        GlobalSearchInfiniteScrollComponent,
        BulkValidateDialogComponent,
        MultiSelectGroupsStepsComponent,
        BulkSignDialogComponent,
        RoleSelectionComponent,
        CommunicationBannerConfigComponent,
        CommunicationBannerComponent,
        SpinnerComponent,
        EquipmentEntryItemDialogComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AppMaterialModule,
        AppPipesModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        InViewportDirective,
        AgGridModule,
        NgxSummernoteModule,
        InfiniteScrollModule,
        OverlayModule], providers: [
        AppConfigService,
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { position: 'right', showDelay: 300 } },
        { provide: APP_INITIALIZER, useFactory: initializeConfig, deps: [AppConfigService], multi: true },
        AuthGuard,
        EPICWSService,
        LoginService,
        AppUpdateService,
        ProcedureChangeTypeService,
        RoleService,
        LoggerService,
        {
            provide: LOCAL_STORAGE_CONFIG,
            useValue: {
                prefix: 'epic',
                storageType: 'localStorage',
            },
        },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: 'JSNLog', useValue: JL },
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
          useValue: {
            hideSingleSelectionIndicator: true,
            hideMultipleSelectionIndicator: true,
          },
        },
        {
          provide: MAT_CHIPS_DEFAULT_OPTIONS,
          useValue: {
            separatorKeyCodes: [ENTER],
            hideSingleSelectionIndicator: true,
          },
        },
        {
          provide: MAT_SELECT_CONFIG,
          useValue: {
            hideSingleSelectionIndicator: true,
            panelWidth: null,
          },
        },
    ] })
export class AppModule {
}
