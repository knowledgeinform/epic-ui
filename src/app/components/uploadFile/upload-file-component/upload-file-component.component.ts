import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Attachment} from '@app/interfaces/attachment';
import {saveAs} from 'file-saver';
import * as _ from 'lodash';
import {MessageService} from '@app/services/message.service';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogModel
} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OfflineService} from '@app/services/offline.service';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EditType} from '@app/interfaces/edit-type.dto';
import {RedLineComment} from '@app/interfaces/comment.dto';
import {RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData} from '@app/components/red-black-line-comment-dialog/red-black-line-comment-dialog.component';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {LoginService} from '@app/services/login.service';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {LoggerService} from '@app/services/logger.service';
import {AttachmentService} from '@app/services/attachment.service';
import {AttachmentType} from '@app/interfaces/attachment-type.enum';
import {Run} from '@app/interfaces/Run';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {StepDef} from '@app/interfaces/step-def.interface';

@Component({
  selector: 'app-upload-file-component',
  templateUrl: './upload-file-component.component.html',
  styleUrls: ['./upload-file-component.component.css']
})
export class UploadFileComponentComponent implements OnInit, OnDestroy {

  @Input() attachments: Attachment[] = [];
  @Input() attachmentType: AttachmentType;
  @Input() parentPk: number;
  @Input() isReadOnly: boolean = false;
  @Input() redliningEnabled: boolean = false;
  @Input() run: Run = null;
  @Input() step: StepDef = null;
  @Input() procedureData: ProcedureDetails = null;

  @Output() attachmentsChange = new EventEmitter<Attachment[]>();
  @Output() redLineCommentChange = new EventEmitter<RedLineComment>();
  @Output() stepChange = new EventEmitter<StepDef>();
  @Output() runChange = new EventEmitter<Run>();
  isOffline = false;
  private subscriptions: Subscription[] = [];
  redLineComment: RedLineComment = null;
  public EditType = EditType;

  constructor(private attachmentService: AttachmentService,
              private messageService: MessageService,
              public dialog: MatDialog,
              public offlineService: OfflineService,
              public matSnackbar: MatSnackBar,
              private loginService: LoginService,
              private loggerService: LoggerService
  ) {
  }

  ngOnInit() {
    // Make upload controls readonly when offline
    const offlineSub = this.offlineService.offlineSubject.subscribe(isOffline => {
      isOffline ? this.isOffline = true : this.isOffline = false;
    });
    this.subscriptions.push(offlineSub);
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions.
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  uploadFile(event) {
    this.attachmentService.getMaxUploadSize().subscribe((maxSizeStr) => {
      const maxSize = parseInt(maxSizeStr, 10);

      // Safeguard against invalid server response
      if (isNaN(maxSize)) {
        this.handleAttachmentError('Could not determine maximum upload size from the server.');
        return;
      }

      let editType = this.attachmentType === 'STEP_RUN' || this.attachmentType === 'RUN' ? EditType.RUN : EditType.ORIGINAL;
      let lastElement = false;

      if (this.redliningEnabled && !_.isNil(this.procedureData)) {
        // handle getting a redline comment
        this.getRedLineDialog().afterClosed().subscribe((data) => {
          this.handleRedLineDialogResponse(data);
          if (this.redLineComment) {
            for (let index = 0; index < event.length; index++) {
              const element = event[index];
              if (index === event.length - 1) {
                lastElement = true;
              }

              if (this.hasAttachmentErrors(element)) return;

              // Validate file size against max allowed size
              if (element.size > maxSize) {
                this.handleAttachmentError(`File '${element.name}' exceeds the maximum allowed upload size of ${maxSize} bytes.`);
                return;
              }

              editType = EditType.REDLINE_ADD;

              // need a redline comment except if this is a step
              const pk = !this.step ? this.parentPk : this.step.pk;
              const comment = !this.step ? this.redLineComment : null;
              this.sendAttachmentToServer(element, editType, comment, lastElement, pk);
            }
          }
        });
      } else {
        for (let index = 0; index < event.length; index++) {
          const element = event[index];
          if (index === event.length - 1) {
            lastElement = true;
          }

          if (this.hasAttachmentErrors(element)) return;

          // Validate file size against max allowed size
          if (element.size > maxSize) {
            this.handleAttachmentError(`File '${element.name}' exceeds the maximum allowed upload size of ${maxSize} bytes.`);
            return;
          }
          this.sendAttachmentToServer(element, editType, null, lastElement, this.parentPk);
        }
      }
    });
  }

  hasAttachmentErrors(file: any): boolean {
    if (!file || !this.parentPk || !this.attachmentType) {
      let errorMessage;
      if (!file) {
        errorMessage = 'File does not exist or could not be retrieved from the event data';
      } else if (!this.parentPk) {
        errorMessage = 'The parent for this attachment is unknown';
      } else {
        errorMessage = 'The attachment type is unknown';
      }
      this.handleAttachmentError(errorMessage);
      return true;
    }
    return false;
  }



  sendAttachmentToServer(element: any, editType: EditType, redLineComment: RedLineComment, lastElement: boolean, parentPk: number): void {
    const formData = new FormData();
    formData.append('file', element);
    formData.append('parentPk', parentPk.toString());
    formData.append('attachmentType', this.attachmentType);
    formData.append('editType', editType);
    formData.append('redLineComment', JSON.stringify(this.redLineComment));

    this.loggerService.info('Uploading an attachment of type ' + this.attachmentType + ' to parent with pk ' + parentPk);

    if (this.attachmentType === AttachmentType.STEP_RUN) {
      this.attachmentService.saveRunStepAttachment(formData).subscribe((data) => {
        if (data.errorMessage) {
          this.handleAttachmentError(data.errorMessage);
          return;
        }
        if (this.attachments === null) {
          this.attachments = [];
        }
        _.assign(this.step, data);
        this.stepChange.emit(this.step);
      });
    } else if (this.attachmentType === AttachmentType.RUN) {
      this.attachmentService.saveRunAttachment(formData).subscribe((updatedRun) => {
        if (updatedRun.errorMessage) {
          this.handleAttachmentError(updatedRun.errorMessage);
          return;
        }
        if (this.attachments === null) {
          this.attachments = [];
        }
        _.assign(this.run, updatedRun);
        this.runChange.emit(this.run);
      });
    } else {
      this.attachmentService.saveAttachment(formData).subscribe((data) => {
          // Handle error response
          if (data.errorMessage) {
            this.handleAttachmentError(data.errorMessage);
            return;
          }

          if (this.attachments == null) {
            this.attachments = [];
          }

          this.attachments.push(data);
          this.attachmentsChange.emit(this.attachments);

          // if this is a redline, emit the comment; it needs to be acted on by the parent component
          if (this.redLineComment) {
            this.redLineCommentChange.emit(this.redLineComment);
          }

          // if done uploading attachments, reset the comment.
          if (lastElement) {
            this.redLineComment = null;
          }
        },
        error => {
          this.loggerService.error('An error occurred when uploading an attachment: ' + error);
        });
    }
  }

  downloadAttachment(pk: number, editType: EditType) {
    if (!this.isOffline && editType !== EditType.REDLINE_DELETE) {
      this.loggerService.info('Downloading attachment with pk ' + pk);
      this.attachmentService.downloadAttachment(pk).subscribe((res) => {
        if (!res.headers) {
          this.loggerService.error('Could not download attachment with pk ' + pk + ' from the attachments server');
          this.messageService.showSnackBar('Could not reach the attachments server', 'CLOSE', 10000);
          return;
        }
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].replace(/\"/g, '').trim();
        saveAs(res.body, filename);
      });
    }
  }

  deleteAttachment(pk, originalFilename) {
    const dialogData = new ConfirmationDialogModel('Delete File Attachment', 'Do you want to delete the file attachment named <' + originalFilename + '>?');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        if (this.redliningEnabled) {
          this.handleRedLineDeleteOfAttachment(pk);
        } else {
          this.sendDeleteAttachmentActionToServer(pk);
        }
      }
    });
  }

  // method for deleting the attachment (not redline)
  private sendDeleteAttachmentActionToServer(pk: number): void {
    this.loggerService.info('Deleting an attachment with pk ' + pk);
    if (this.attachmentType === AttachmentType.STEP_RUN) {
      this.attachmentService.deleteRunStepAttachment(pk).subscribe((data) => {
        if (!data.errorMessage) {
          _.assign(this.step, data);
          _.remove(this.step.runStepAttachments, (a => a.pk === pk));
          this.stepChange.emit(this.step);
        } else {
          this.loggerService.error('Error deleting attachment from step', data);
          this.handleAttachmentError(data.errorMessage);
        }
      });
    } else if (this.attachmentType === AttachmentType.RUN) {
      this.attachmentService.deleteRunAttachment(pk).subscribe((updatedRun) => {
        if (!updatedRun.errorMessage) {
          _.assign(this.run, updatedRun);
          this.runChange.emit(this.run);
        } else {
          this.loggerService.error('Error deleting attachment from run', updatedRun);
          this.handleAttachmentError(updatedRun.errorMessage);
        }
      });
    } else {
      this.attachmentService.deleteAttachment(pk).subscribe((data) => {
        if (!_.isNil(data)) {
          // if here, error.
          this.loggerService.error('Error deleting attachment');
          this.handleAttachmentError('Could not delete attachment with pk ' + pk);
        } else {
          // delete successful...remove from list
          _.remove(this.attachments, (a => a.pk === pk));
          this.attachmentsChange.emit(this.attachments);
        }
      });
    }
  }

  private handleRedLineDeleteOfAttachment(pk: number): void {
    if (!this.step) {
      // first get a redline comment
      this.getRedLineDialog().afterClosed().subscribe((data) => {
        this.handleRedLineDialogResponse(data);
        if (this.redLineComment) {
          this.sendRedLineDeleteToServer(pk);
        }
      });
    } else {
      this.sendRedLineDeleteToServer(pk);
    }
  }

  private sendRedLineDeleteToServer(pk: number): void {
    this.loggerService.info('Deleting attachment as a redline for attachment with pk ' + pk);
    this.attachmentService.updateAttachmentAsRedLineDelete(pk, this.redLineComment).subscribe((response) => {
      // response should be null unless an error was thrown.
      if (response) {
        const description = 'Error saving red line delete of attachment';
        this.loggerService.error(description);
        this.handleAttachmentError('Cannot red line delete attachment due to error; consult EPIC team');
        return;
      }
      // we need to update the attachment in the array with its new editType.
      // note that we are not removing the attachment at this time.
      const index = this.attachments.findIndex(a => a.pk === pk);
      this.attachments[index].editType = EditType.REDLINE_DELETE;
      this.attachmentsChange.emit(this.attachments);

      // emit the redline comment change; the parent component needs to act on it.
      this.redLineCommentChange.emit(this.redLineComment);
      this.redLineComment = null;
    });
  }

  private getRedLineDialog(): MatDialogRef<RedBlackLineCommentDialogComponent> {
    return this.dialog.open<RedBlackLineCommentDialogComponent, RedBlackLineCommentDialogData>(RedBlackLineCommentDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        commentType: CommentType.RED_LINE_COMMENT,
        procedureDetails: this.procedureData.asDTO(),
      }
    });
  }

  handleRedLineDialogResponse(data: RedLineComment): void {
    if (data === null) {
      this.messageService.showSnackBar('Red Line Change Cancelled by User', 'CLOSE');
    } else {
      // set up the red line comment
      this.redLineComment = data;
      this.redLineComment.users = this.loginService.getCurrentUser().asDTO();
      this.redLineComment.commentTimestamp = new Date();
      if (this.attachmentType === AttachmentType.PROCEDURE) {
        this.redLineComment.procedureDetails = {pk: this.run.procedureDetails.pk, editType: this.run.procedureDetails.editType, originalProcedureDetails: {pk: this.parentPk}} as ProcedureDetailsDTO;
      } else if (this.attachmentType === AttachmentType.STEP_DEF) {
        this.redLineComment.procedureDetails = {pk: this.procedureData.pk, editType: this.procedureData.editType} as ProcedureDetailsDTO;
        this.redLineComment.stepDef = this.step.asDTO();
      }
    }
  }

  private handleAttachmentError(error: string) {
    this.loggerService.error('Could not successfully upload the attachment: ' + error);
    const snackbar = this.matSnackbar.open('Your file could not be attached due to an error: ' + error, 'CLOSE');
    snackbar.onAction().subscribe(() =>  window.location.reload());
  }
}
