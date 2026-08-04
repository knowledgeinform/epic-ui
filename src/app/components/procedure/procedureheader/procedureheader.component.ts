import {Component, EventEmitter, Input, OnInit, Output, OnChanges} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  AutocompleteDialogBinder,
  SingleAutocompleteDialogComponent
} from '../../single-autocomplete-dialog/single-autocomplete-dialog.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {OfflineService} from '@app/services/offline.service';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {LoginService} from '@app/services/login.service';
import * as _ from 'lodash';
import {EditType} from '@app/interfaces/edit-type.dto';
import {ApprovalType} from '@app/interfaces/approval';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {AttachmentType} from '@app/interfaces/attachment-type.enum';
import {Run} from '@app/interfaces/Run';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';
import {ApproverStatusService} from "@app/services/approver-status.service";
import { AppComponent } from '@app/components/app/app.component';

interface User {
  userId: number;
}

@Component({
  selector: 'app-procedureheader',
  templateUrl: './procedureheader.component.html',
  styleUrls: ['./procedureheader.component.scss']
})
export class ProcedureheaderComponent implements OnInit, OnChanges {
  @Input() isLockedFromEditing: boolean;

  savingApprover: boolean = false;
  savingAuthor: boolean = false;

  public EditType = EditType;
  public AttachmentType = AttachmentType;
  public ProcedureStatus = ProcedureStatus;

  @Input() procedureData: ProcedureDetails;
  @Input() printMode: boolean = false;
  @Output() procedureDataChange = new EventEmitter();
  @Input() run: Run = null;
  @Input() redliningEnabled: boolean = false;

  public procedureName: string;
  public procedureDescription: string;

  // TODO: Could these be pipes instead?
  get approvers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'APPROVER' && !e.approverDisabled);
  }

  get reviewers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'REVIEWER');
  }

  get disabledApprovers() {
    return this.procedureData.procedureApprovals.filter(e => e.approvalType === 'APPROVER' && e.approverDisabled);
  }

  constructor(
    private epicService: EPICWSService,
    public dialog: MatDialog,
    private messageService: MessageService,
    public offlineService: OfflineService,
    public loginService: LoginService,
    public lineEditReportingService: LineEditReportingService,
    private loggerService: LoggerService,
    private approverStatusService: ApproverStatusService,
    private app: AppComponent
  ) {
  }

  ngOnInit(): void {
      this.procedureName = this.procedureData.procedureDef.name;
      this.procedureDescription = this.procedureData.procedureDef.description;
  }

  ngOnChanges(changes) {
    if (changes.procedureData) {
      this.procedureName = changes.procedureData.currentValue.procedureDef.name;
      this.procedureDescription = changes.procedureData.currentValue.procedureDef.description;
    }
  }

  // TODO: Improve error handling?
  changeProcedureAuthor(): void {
    const validator: AutocompleteDialogBinder<User> = {
      title: 'Change Procedure Author',
      instructions: '',
      placeholder: 'Name or 521',
      autocompleteSource: this.epicService.getMatchingUsers,
      autocompleteDisplay: (user?: any): string | undefined => user ? user.displayName : undefined,
      validateSelection: (author) =>
        (typeof author === 'string') ? 'Not Found' :
          (this.procedureData.procedureHeader.user.userId === author.userId) ? 'Already the author' : null,
    };

    const dialogRef = this.dialog.open(SingleAutocompleteDialogComponent, {
      width: '300px',
      data: {validator: validator},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savingAuthor = true;
        this.loggerService.info('Changing the author for procedure with pk ' + this.procedureData.pk + ' from user '
          + this.procedureData.procedureHeader.user.userId + ' to user ' + result.userId);
        this.epicService.changeProcedureAuthor(result.userId, this.procedureData.procedureHeader.pk).subscribe((data) => {
          this.savingAuthor = false;
          if (data) {
            this.procedureData.procedureHeader.user = data;
          } else {
            this.loggerService.error('Could not save author change');
          }
        });
      }
    });
  }

  // TODO: The addApprover and addReviewer methods should probably warn the user if the user they are selecting is already
  // added as the other type. See EPIC-580.
  addApprover(): void {
    const validator: AutocompleteDialogBinder<User> = {
      title: 'Add Approver',
      instructions: '',
      placeholder: 'Name or 521',
      autocompleteSource: this.epicService.getMatchingUsers,
      autocompleteDisplay: (user?: any): string | undefined => user ? user.displayName : undefined,
      validateSelection: (approver) =>
        (typeof approver === 'string') ? 'Not Found' :
          this.procedureData.procedureApprovals.find(a => a.approvalType === 'APPROVER' && a.users.userId === approver.userId) === undefined ?
            null : 'Already an approver',
    };

    const dialogRef = this.dialog.open(SingleAutocompleteDialogComponent, {
      width: '300px',
      data: {validator: validator},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addApproval(result.userId, ApprovalType.APPROVER);
      }
    });
  }

  addReviewer(): void {
    const validator: AutocompleteDialogBinder<User> = {
      title: 'Add Reviewer',
      instructions: '',
      placeholder: 'Name or 521',
      autocompleteSource: this.epicService.getMatchingUsers,
      autocompleteDisplay: (user?: any): string | undefined => user ? user.displayName : undefined,
      validateSelection: (reviewer) =>
        (typeof reviewer === 'string') ? 'Not Found' :
          this.procedureData.procedureApprovals.find(a =>
            a.approvalType === 'REVIEWER' &&
            a.users.userId === reviewer.userId
          ) === undefined ?
            null : 'Already a reviewer',
    };

    const dialogRef = this.dialog.open(SingleAutocompleteDialogComponent, {
      width: '300px',
      data: {validator: validator},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addApproval(result.userId, ApprovalType.REVIEWER);
      }
    });
  }

  // TODO: Add error handling
  addApproval(userId: number, type: ApprovalType) {
    const approval = {
      procedureDetailsPk: this.procedureData.pk,
      approvalType: type,
      userId: userId,
    };

    this.savingApprover = true;
    this.loggerService.info('Saving ' + userId + ' as a' + type + ' for procedure with pk ' + this.procedureData.pk);
    this.epicService.saveProcedureHeaderUserData(approval).subscribe((data) => {
      this.savingApprover = false;
      this.procedureData.procedureApprovals.push(data);
    });
  }

  removeApproval(approval) {
    this.loggerService.info('Removing an approver/reviewer from procedure with pk ' + this.procedureData.pk, approval);
    this.epicService.deleteProcedureHeaderApproval(approval).subscribe((isDeleted) => {
      // Check if the error message exists to determine if an error was returned
      if (isDeleted.errorMessage){
        this.loggerService.error('Unable to delete approver ' + approval.users.displayName);
        this.messageService.showSnackBar
        ('Unable to delete approver: ' + approval.users.displayName  + ' caused by error: ' + isDeleted.errorMessage, 'CLOSE', 10000);
      }
      else {
        this.procedureData.procedureApprovals = this.procedureData.procedureApprovals.filter((pa) => pa !== approval);
        //update procedure data too
        this.epicService.getProcedureDetailsByUniqueCode(this.procedureData.id).subscribe(data => {
          if (data.error) {
            this.loggerService.error('Could not retrieve procedure with id ' + this.procedureData.id + ' to display in run preview; ' + data.error);
            this.dialog.open(ErrorDialogComponent, {
              data: {
                description: 'Error retrieving procedure from the server',
                errorMessage: 'error',
              },
            });
          } else {
            this.procedureData = data;
            this.approverStatusService.announceApproverStatusChange(this.procedureData);
          }
        });
      }
    });
  }

  setApproverStatus(approval: ProcedureApproval, disabled: boolean){
    if (!disabled){
      this.loggerService.info('Disabling an approver/reviewer from procedure with pk ' + this.procedureData.pk, approval);
    } else {
      this.loggerService.info('Re-enabling an approver/reviewer from procedure with pk ' + this.procedureData.pk, approval);
    }

    if (_.isEmpty(approval.comments)) {
      this.removeApproval(approval);
    } else {
      this.epicService.setProcedureApproverStatus(approval, disabled).subscribe((data) => {
        // Check if the error message exists to determine if an error was returned
        if (data.errorMessage) {
          this.loggerService.error('Unable to change approver status for ' + approval.users.displayName);
          this.messageService.showSnackBar
          ('Unable to change approver status for: ' + approval.users.displayName  + ' caused by error: ' + data.errorMessage, 'CLOSE', 10000);
        } else {
          //update procedure data too
          this.epicService.getProcedureDetailsByUniqueCode(this.procedureData.id).subscribe(data => {
            if (data.error) {
              this.loggerService.error('Could not retrieve procedure with id ' + this.procedureData.id + ' to display in run preview; ' + data.error);
              this.dialog.open(ErrorDialogComponent, {
                data: {
                  description: 'Error retrieving procedure from the server',
                  errorMessage: 'error',
                },
              });
            } else {
              this.procedureData = data;
              this.approverStatusService.announceApproverStatusChange(this.procedureData);
            }
          });
        }
    })}
  }

  saveProcedureName(): void {
    const procedureId = this.procedureData.procedureDef.pk;

    if (!this.procedureName || _.isEmpty(this.procedureName)) {
      this.messageService.showSnackBar('Procedure name cannot be blank', 'CLOSE', 10000);
      this.procedureName = this.procedureData.procedureDef.name
      return;
    }

    this.loggerService.info('Updating the procedure name to ' + this.procedureName + ' for procedureDef with pk ' + procedureId);
    this.epicService.updateProcedureDefAttributes(procedureId, this.procedureName, '').subscribe((data) => {
      if (data.errorMessage) {
        this.loggerService.error('Unable to save procedure name change: ' + data.errorMessage);
        this.messageService.showSnackBar('Could not save procedure name change due to error: ' + data.errorMessage, 'CLOSE', 10000);
      } else {
        this.procedureData.procedureDef = data;
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Procedure name change saved', 'CLOSE');
        this.app.setPageTitle(this.procedureData.id + ' - ' + this.procedureData.procedureDef.name);
      }
      this.procedureName = this.procedureData.procedureDef.name;
    });
  }

  saveProcedureDescription(): void {
    const procedureId = this.procedureData.procedureDef.pk;

    if (!this.procedureDescription || _.isEmpty(this.procedureDescription)) {
      this.messageService.showSnackBar('Procedure description cannot be blank', 'CLOSE');
      this.procedureDescription = this.procedureData.procedureDef.description;
      return;
    }

    this.loggerService.info('Updating the procedure description to ' + this.procedureDescription + ' for procedureDef with pk ' + procedureId);
    this.epicService.updateProcedureDefAttributes(procedureId, '', this.procedureDescription).subscribe((data) => {
      if (data.errorMessage) {
        this.loggerService.error('Unable to save procedure description change: ' + data.errorMessage);
        this.messageService.showSnackBar('Could not save procedure description change due to error: ' + data.errorMessage, 'CLOSE', 10000);
      } else {
        this.procedureData.procedureDef = data;
        this.procedureDataChange.emit(this.procedureData);
        this.messageService.showSnackBar('Procedure description change saved', 'CLOSE');
      }
      this.procedureDescription = this.procedureData.procedureDef.description;
    });
  }

  public addRedLineToRun(comment: RedLineComment): void {
    this.run.procedureDetails.redLineComments.push(comment);
    this.lineEditReportingService.findAllLineEdits(this.run.procedureDetails);
  }
}

