import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RedBlackLineComment } from '@app/interfaces/comment.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import { BlackRedLineSignature } from '@app/interfaces/second-signature.dto';
import { Users } from '@app/interfaces/users';
import { EPICWSService } from '@app/services/epic-ws.service';
import { LineEditService } from '@app/services/line-edit.service';
import { LoggerService } from '@app/services/logger.service';
import { MessageService } from '@app/services/message.service';
import { Utils } from '@app/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-sign-comment',
  templateUrl: './sign-comment.component.html',
  styleUrls: ['./sign-comment.component.css']
})
export class SignCommentComponent implements  OnChanges {

  @Input() public readonly: boolean;
  @Input() public comment: RedBlackLineComment;
  @Input() public role?: ProgramRoleDTO; // Null in the case of a change type that allows all signers.
  @Input() public procedureData: ProcedureDetails;
  @Input() public signature: BlackRedLineSignature;
  @Input() redLines: boolean;


  public formControl: UntypedFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.maxLength(14),
  ]);
  public saving: boolean = false;
  public STATES = STATES;
  public state: STATES;
  public preResignSignature: BlackRedLineSignature;

  constructor(
    public messageService: MessageService,
    public epicService: EPICWSService,
    public dialog: MatDialog,
    private loggerService: LoggerService,
    private lineEditService: LineEditService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.state = this.signature ? STATES.SIGNED : STATES.UNSIGNED;
  }

  submitSignature(): void {
    if (this.formControl.valid && this.formControl.value.length > 0) {
      this.saving = true;

      // parse the username and pin into a Users object
      const userInfo = this.lineEditService.parseSignatureStringForUserNameAndPin(this.formControl.value);
      if (_.isNil(userInfo)) {
        this.lineEditService.displaySignatureParseErrorMessage(this.formControl.value);
        this.formControl.reset();
        this.saving = false;
        return;
      }
      const newSignature = Utils.createBlackRedLineSignature(
        this.comment,
        new Users().loadFromDTO(userInfo),
        this.role,
      );
      this.lineEditService.saveBlackRedLineSignature([newSignature]).subscribe((data) => {
        this.saving = false;
        this.formControl.reset();
        if (_.isNil(data.errorMessage)) {
          this.comment.blackRedLineSignatures = _.concat(this.comment.blackRedLineSignatures, data); // Concat rather than `push` to avoid issue where the server may return `blackRedLineSignatures` as null.

          this.signature = data[0];
          this.state = STATES.SIGNED;

          this.loggerService.info('Successfully saved signature for line edit', this.comment);
          this.messageService.showSnackBar('Line edit approval saved', 'CLOSE');
        } else {
          this.loggerService.error('Error saving signature for line edit: ' + data.errorMessage);
          this.messageService.showSnackBar("Unable to save red/black line signature, error caused by: " + data.errorMessage, 'CLOSE', 10000);

          // Revert signature if resigning failed.
          if (this.state === STATES.RESIGNING) this.signature = this.preResignSignature;
        }
      });
    }
  }

  resign(): void {
    this.preResignSignature = this.signature;
    this.state = STATES.RESIGNING;
    this.formControl.reset();
    this.messageService.showSnackBar('Current approval signature will be retained until new signature is saved.', 'CLOSE');
  }

  public cancelResign() {
    this.signature = this.preResignSignature;
    this.formControl.reset();
    this.state = STATES.SIGNED;
  }

}

enum STATES {
  UNSIGNED = 'UNSIGNED',
  SIGNED = 'SIGNED',
  RESIGNING = 'RESIGNING',
}
