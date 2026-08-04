import {Component, Inject} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProcedureRunComponent} from '@app/components/procedure/procedure-run/procedure-run.component';
import {Utils} from '@app/utils';
import * as _ from 'lodash';
import {MessageService} from '@app/services/message.service';
import {EditType} from '@app/interfaces/edit-type.dto';
import {BlackRedLineSignature} from '@app/interfaces/second-signature.dto';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {EPICWSService} from '@app/services/epic-ws.service';
import {LineEditReportingService} from '@app/services/line-edit-reporting.service';
import {CommentType} from '@app/interfaces/comment-type.dto';
import {Users} from '@app/interfaces/users';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import { LineEditService } from '@app/services/line-edit.service';

@Component({
  selector: 'app-line-edit-bulk-sign-dialog',
  templateUrl: './line-edit-bulk-sign-dialog.component.html',
  styleUrls: ['./line-edit-bulk-sign-dialog.component.css']
})
export class LineEditBulkSignDialogComponent {

  public signature = new UntypedFormControl('', [Validators.required, Validators.maxLength(14)]);
  procedureData: ProcedureDetails;
  step: StepDefDTO;
  couldNotApproveSomeEdits: boolean = false;

  constructor(@Inject(MatDialogRef) public dialogRef: MatDialogRef<ProcedureRunComponent>,
              public messageService: MessageService,
              @Inject(MAT_DIALOG_DATA) data,
              public epicService: EPICWSService,
              public dialog: MatDialog,
              public lineEditReportingService: LineEditReportingService,
              public lineEditService: LineEditService,
              private loggerService: LoggerService) {
    this.procedureData = data.procedureData;
    this.step = data.step;
  }



  submitSignatureForAllLineEdits(event): void {
    // parse the username and pin
    const usersDTO = this.lineEditService.parseSignatureStringForUserNameAndPin(this.signature.value); 
    if (_.isNil(usersDTO)) {
      this.lineEditService.displaySignatureParseErrorMessage( this.signature.value); 
      this.signature.reset();
      return;
    }
    const userInfo = new Users().loadFromDTO(usersDTO);
    const signatureArray = [];

    if (this.procedureData) {
      this.signForAllLineEditsInProcedure(signatureArray, userInfo);
    } else if (this.step) {
      this.signForAllLineEditsOnStep(signatureArray, userInfo);
    }
    this.dialogRef.close();
  }

  private signForAllLineEditsInProcedure(signatureArray: BlackRedLineSignature[], userInfo: Users): void {
    // we need to apply this signature to all of the black and red line comments for this run
    this.lineEditReportingService.procedureLevelBlackLines.getLines(this.procedureData.pk).forEach(blackLine => {
      if (blackLine.users.username === userInfo.username) {
        this.couldNotApproveSomeEdits = true;
        this.loggerService.warn('Cannot sign black line comment due to having created it', blackLine);
      } else {
        // TODO: Uncomment this line. Commented per EPIC-847.
        // signatureArray.push(Utils.createBlackRedLineSignature(blackLine, userInfo));
      }
    });

    signatureArray = this.processLineEdits(this.lineEditReportingService.stepBlackLines.getLines(this.procedureData.pk),
      signatureArray, userInfo, CommentType.BLACK_LINE_COMMENT);

    // do not sign off on red lines if this is not the redlined run.
    if (this.procedureData.editType === EditType.REDLINE_EDIT) {
      this.lineEditReportingService.procedureLevelRedLines.getLines(this.procedureData.pk).forEach(redLine => {
        if (redLine.users.username === userInfo.username) {
          this.couldNotApproveSomeEdits = true;
          this.loggerService.warn('Cannot sign red line comment due to having created it', redLine);
        } else {
          // TODO: Uncomment this line. Commented per EPIC-847.
          // signatureArray.push(Utils.createBlackRedLineSignature(redLine, userInfo));
        }
      });

      signatureArray = this.processLineEdits(this.lineEditReportingService.instructionRedLines.getLines(this.procedureData.pk),
        signatureArray, userInfo, CommentType.RED_LINE_COMMENT);
      signatureArray = this.processLineEdits(this.lineEditReportingService.groupRedLines.getLines(this.procedureData.pk),
        signatureArray, userInfo, CommentType.RED_LINE_COMMENT);
      signatureArray = this.processLineEdits(this.lineEditReportingService.stepRedLines.getLines(this.procedureData.pk),
        signatureArray, userInfo, CommentType.RED_LINE_COMMENT);
    }

    this.lineEditService.saveBlackRedLineSignature(signatureArray).subscribe((savedSignatures) => {
      if (!savedSignatures.errorMessage) {

        Utils.updateLineEditSignaturesForRun(savedSignatures, this.procedureData);

        let message = 'Line edit approvals saved';
        if (this.couldNotApproveSomeEdits) {
          message = message + '. Could not approve some red/black lines due to approver being the same person as the user who ' +
            'created the red/black line. Please have a suitable approver review those items.';
        }
        this.loggerService.info(message + ' Run has id: ' + this.procedureData.id);
        this.messageService.showSnackBar(message, 'CLOSE');
      } else {
        this.loggerService.error('Error while saving signature for black/red lines: ' + savedSignatures.errorMessage);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving approval of red/black line edit',
            errorMessage: savedSignatures.errorMessage,
          }
        });
      }
    });
  }

  private signForAllLineEditsOnStep(signatureArray: BlackRedLineSignature[], userInfo: Users): void {
    signatureArray = this.processLineEdits([this.step], signatureArray, userInfo, CommentType.BLACK_LINE_COMMENT);

    // do not sign off on redlines unless this is a redlined step.
    if (this.step.editType === EditType.REDLINE_DELETE || this.step.editType === EditType.REDLINE_ADD || this.step.editType === EditType.REDLINE_EDIT) {
      signatureArray = this.processLineEdits([this.step], signatureArray, userInfo, CommentType.RED_LINE_COMMENT);
    }

    this.lineEditService.saveBlackRedLineSignature(signatureArray).subscribe((savedSignatures) => {
      if (!savedSignatures.errorMessage) {

        // we are going to map these signatures such that the key is the comment pk and the value is the signature.
        const signatureMap = new Map<number, BlackRedLineSignature>();
        _.forEach(savedSignatures, s => signatureMap.set(s.comment.pk, s));
        const allLineComments = this.step.blackLineComments.concat(this.step.redLineComments);
        allLineComments.forEach(c => {
          const signature = signatureMap.get(c.pk);
          if (signature) {
            c.blackRedLineSignatures = _.map(c.blackRedLineSignatures, s => signatureMap.get(c.pk));
          }
        });

        let message = 'Line edit approvals saved';
        if (this.couldNotApproveSomeEdits) {
          message = message + '. Could not approve some red/black lines due to approver being the same person as the user who ' +
            'created the red/black line. Please have a suitable approver review those items.';
        }
        this.loggerService.info(message + ' StepPk = ' + this.step.pk);
        this.messageService.showSnackBar(message, 'CLOSE');
      } else {
        this.loggerService.error('Error while saving signature for black/red lines on step with pk ' +
          this.step.pk + ': ' + savedSignatures.errorMessage);
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error saving approval of red/black line edit',
            errorMessage: savedSignatures.errorMessage,
          }
        });
      }
    });
  }

  // This method intakes an array of StepDefs, StepGroupsDefs, or ProcedureInstructions, and iterates through them
  // to find red/black line comments that the signing user is allowed to sign. Eligible comments have a signature object
  // created for them, which is pushed to the signature array. The signatureArray is returned.
  private processLineEdits(array: any, signatureArray: BlackRedLineSignature[], userInfo: Users, commentType: CommentType): BlackRedLineSignature[] {
    _.flatten(array.map((obj) => {
      return commentType === CommentType.BLACK_LINE_COMMENT ? obj.blackLineComments : obj.redLineComments;
    })).forEach(comment => {
      if (comment['users'].username === userInfo.username) {
        this.couldNotApproveSomeEdits = true;
        this.loggerService.warn('Cannot sign line edit comment due to having created it', comment);
      } else {

        // TODO: Uncomment these lines. Commented per EPIC-847.
        if (commentType === CommentType.BLACK_LINE_COMMENT) {
          // signatureArray.push(Utils.createBlackRedLineSignature(<BlackLineDto> comment, userInfo));
        } else {
          // signatureArray.push(Utils.createBlackRedLineSignature(<RedLineComment> comment, userInfo));
        }
      }
    });
    return signatureArray;
  }
}
