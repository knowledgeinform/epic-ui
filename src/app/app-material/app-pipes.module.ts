import { NgModule } from '@angular/core';
import { ApproverDueDatePipe } from '@app/pipes/approver-due-date.pipe';
import { ApproverIsApprovedColorPipe } from '@app/pipes/approver-is-approved-color.pipe';
import { ApproverIsApprovedIconPipe } from '@app/pipes/approver-is-approved-icon.pipe';
import { ApproverIsApprovedTitlePipe } from '@app/pipes/approver-is-approved-title.pipe';
import { CanReleaseProcedurePipe } from '@app/pipes/can-release-procedure.pipe';
import { CanTransitionProcedureOrRunPipe } from '@app/pipes/can-transition-procedure-or-run.pipe';
import { ChangeTypeRequiresRolePipe } from '@app/pipes/change-type-requires-role.pipe';
import { DisabledApproverIsApprovedColorPipe } from '@app/pipes/disabled-approver-is-approved-color.pipe';
import { FindInCollectionPipe } from '@app/pipes/find-in-collection.pipe';
import { GetCommentSignatureForRolePipe } from '@app/pipes/get-comment-signature-for-role.pipe';
import { IsAfterTodayPipe } from '@app/pipes/is-after-today.pipe';
import { IsBeforeTodayPipe } from '@app/pipes/is-before-today.pipe';
import { JoinPropPipe } from '@app/pipes/join-prop.pipe';
import { LineEditCountTextPipe } from '@app/pipes/line-edit-count-text.pipe';
import { LineEditTypeTextPipe } from '@app/pipes/line-edit-type-text.pipe';
import { NonconformanceCountTextPipe } from '@app/pipes/nonconformance-count-text.pipe';
import { ProcedureStatusColorPipe } from '@app/pipes/procedure-status-color.pipe';
import { ProcedureStatusIconPipe } from '@app/pipes/procedure-status-icon.pipe';
import { ProgramRoleIsMetPipe } from '@app/pipes/program-role-is-met.pipe';
import { RoleHasSignaturesPipe } from '@app/pipes/role-has-signatures.pipe';
import { RosterRoleIsMetPipe } from '@app/pipes/roster-role-is-met.pipe';
import { RunStatusColorPipe } from '@app/pipes/run-status-color.pipe';
import { RunStatusIconPipe } from '@app/pipes/run-status-icon.pipe';
import { ShowApprovalControlsPipe } from '@app/pipes/show-approval-controls.pipe';
import { StepDisplayNamePipe } from '@app/pipes/step-display-name.pipe';
import { StepDisplayOrderPipe } from '@app/pipes/step-display-order.pipe';
import { StepGroupDisplayOrderPipe } from '@app/pipes/step-group-display-order.pipe';
import { TableValidationErrorDescriptionPipe } from '@app/pipes/table-validation-error-description.pipe';
import { ValidationErrorCountTextPipe } from '@app/pipes/validation-error-count-text.pipe';
import { ValidationErrorIconColorPipe } from '@app/pipes/validation-error-icon-color.pipe';
import { ValidationErrorIconPipe } from '@app/pipes/validation-error-icon.pipe';
import {ApprovalCommentsDisplayIsReadonlyPipe} from '@app/pipes/approval-comments-display-is-readonly.pipe';
import {CanEditProcedureOrRunPipe} from "@app/pipes/can-edit-procedure-or-run.pipe";
import { NonconformanceCountPipe } from '@app/pipes/nonconformance-count.pipe';
import { LockButtonTextPipe } from '@app/pipes/lock-button-text.pipe';
import { SummernoteEditorCountPercentagePipe } from '@app/pipes/summernote-editor-count-percentage.pipe';
import {RunDescriptionPipe} from "@app/pipes/run-description.pipe";
import {ProcedureDescriptionPipe} from "@app/pipes/procedure-description-pipe";
import {SearchResultCountTextPipe} from "@app/pipes/search-result-count-text.pipe";
import {CanEditApproversPipe} from "@app/pipes/can-edit-approvers.pipe";
import {ApproverChipTooltipPipe} from "@app/pipes/approver-chip-tooltip.pipe";
import {ApproverChipDisabledTooltipPipe} from "@app/pipes/approver-chip-disabled-tooltip.pipe";
import { BlacklineCommentDialogContentPipe } from '@app/pipes/blackline-comment-dialog-content.pipe';
import { BulkSignTypePipe } from '@app/pipes/bulk-sign-type.pipe';
import { BulkLineDisplayNamePipe } from '@app/pipes/bulk-line-display-name.pipe';
import { SignatureButtonDisableConditionPipe } from '@app/pipes/signature-button-disable-condition.pipe'
import { ShowApproverCommentsPipe } from '@app/pipes/show-approver-comments.pipe';

const importsAndExports = [
  JoinPropPipe,
  GetCommentSignatureForRolePipe,
  ProgramRoleIsMetPipe,
  FindInCollectionPipe,
  ChangeTypeRequiresRolePipe,
  RoleHasSignaturesPipe,
  ApproverIsApprovedColorPipe,
  DisabledApproverIsApprovedColorPipe,
  ApproverIsApprovedTitlePipe,
  ApproverIsApprovedIconPipe,
  StepDisplayNamePipe,
  ValidationErrorIconColorPipe,
  ValidationErrorIconPipe,
  LineEditCountTextPipe,
  RunStatusColorPipe,
  RunStatusIconPipe,
  TableValidationErrorDescriptionPipe,
  StepDisplayOrderPipe,
  StepGroupDisplayOrderPipe,
  ApproverDueDatePipe,
  ValidationErrorCountTextPipe,
  NonconformanceCountTextPipe,
  LineEditTypeTextPipe,
  ShowApprovalControlsPipe,
  CanReleaseProcedurePipe,
  CanTransitionProcedureOrRunPipe,
  ProcedureStatusIconPipe,
  ProcedureStatusColorPipe,
  RosterRoleIsMetPipe,
  ChangeTypeRequiresRolePipe,
  RoleHasSignaturesPipe,
  IsBeforeTodayPipe,
  IsAfterTodayPipe,
  ApprovalCommentsDisplayIsReadonlyPipe,
  CanEditProcedureOrRunPipe,
  NonconformanceCountPipe,
  LockButtonTextPipe,
  SummernoteEditorCountPercentagePipe,
  RunDescriptionPipe,
  ProcedureDescriptionPipe,
  SearchResultCountTextPipe,
  CanEditApproversPipe,
  ApproverChipTooltipPipe,
  ApproverChipDisabledTooltipPipe,
  BlacklineCommentDialogContentPipe,
  BulkSignTypePipe,
  BulkLineDisplayNamePipe,
  SignatureButtonDisableConditionPipe,
  ShowApproverCommentsPipe,
];

@NgModule({
    declarations: [
        importsAndExports,
    ],
    exports: [
        importsAndExports,
    ],
})
export class AppPipesModule {
}
