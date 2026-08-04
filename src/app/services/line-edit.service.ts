import { Injectable } from '@angular/core';
import { BlackLineDto } from '@app/interfaces/black-line.dto';
import { BlackRedLineSignature, SecondSignatureType, ProcedurePkSignature } from '@app/interfaces/second-signature.dto';
import * as _ from 'lodash';
import {Observable, Subject} from "rxjs";
import { catchError } from 'rxjs/operators';
import { EPICWSService, httpJsonOptions, Error } from './epic-ws.service';
import { AppConfigService } from './app-config-service.service';
import { HttpClient } from '@angular/common/http';
import { ProgramRole } from '@app/interfaces/program-role';
import {RedBlackLineComment, RedLineComment} from '@app/interfaces/comment.dto';
import {UsersDTO} from '@app/interfaces/users.dto';
import {Utils} from '@app/utils';
import { LoginService } from './login.service';
import { MessageService } from './message.service';
import { LoggerService } from './logger.service';
import {ProgramRoleDTO} from "@app/interfaces/program-role.dto";

@Injectable({
  providedIn: 'root'
})
export class LineEditService {
  blackLineSource = new Subject<BlackLineDto>();
  blackLineEditChanged = this.blackLineSource.asObservable();
  lineSignatureChanged = new Subject<ProcedurePkSignature>();

  constructor(public http: HttpClient,
              private epicWs: EPICWSService,
              private configService: AppConfigService,
              private loginService: LoginService,
              private messageService: MessageService,
              private loggerService: LoggerService) { }

  announceBlackLineChange(blackLine: BlackLineDto): void {
    this.blackLineSource.next(blackLine);
  }

  announceBlackLineChanges(blacklines: BlackLineDto[]): void {
    blacklines.forEach(blackLine => this.announceBlackLineChange(blackLine));
  }
  announceLineSignatureChanges(procedurePk: number, signatures: BlackRedLineSignature[]) {
    signatures.forEach(signature=> {
      this.lineSignatureChanged.next({procedurePk, signature});
    });
  }

  saveBlackRedLineSignature(signatures: BlackRedLineSignature[]): Observable<BlackRedLineSignature[] & Error> {
    return this.http.post<BlackRedLineSignature[]>(`${this.configService.config.apiUrl}/SecondSignature/${SecondSignatureType.BLACK_RED_LINE}/`, signatures, httpJsonOptions)
      .pipe(catchError(this.epicWs.handleErrorFromWs<BlackRedLineSignature[]>('saveBlackRedLineSignature')));
  }
  /**
   * Get comments for the given role and  the role has NOT  signed yet
   * @param role
   * @param signatures
   */
  getSignaturesForRole( role: ProgramRoleDTO, comments: RedBlackLineComment[]){

    let selectedComments = [];
    let findApproverForThisRole = false;
    let continueFetching = true; 

    for ( var i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if ( !_.isNil(comment.procedureChangeType && !_.isNil(comment.procedureChangeType.requiredRoleApprovals) )) {

        findApproverForThisRole = false;
        if (comment.procedureChangeType.acceptsAllSignatures ) {
          findApproverForThisRole = true;
          if (comment.blackRedLineSignatures.length >0  ) // for "accept all signatures, only need one signature" 
            continueFetching = false;
        } else {
          findApproverForThisRole = !_.isNil(_.find(comment.procedureChangeType.requiredRoleApprovals, approver =>{
            if (!approver) return false;
            return approver.pk== role.pk;
          }));
        }
        if (findApproverForThisRole && continueFetching) { // comment contains the role for approver
          const signaturesForThisRole = _.find(comment.blackRedLineSignatures, signature => {
            if (!signature) return false;
            return (signature.programRole.pk === role.pk) ||  comment.procedureChangeType.acceptsAllSignatures;
          });
          if ( _.isNil(signaturesForThisRole)) // either no sigure or this role hasno signature.
            selectedComments.push(comment);
        } // findApproverForThisRole
      } // this comment needs signature
    } // end for loop
    return {findApproverForThisRole, selectedComments};
  }


  parseSignatureStringForUserNameAndPin(signature: string): UsersDTO {
    const pinStartIndex = signature.length - Utils.getPinLength();
    const username = signature.substring(0, pinStartIndex).trim();
    const pin = signature.substring(pinStartIndex).trim();
    if (_.isEmpty(username) || _.isEmpty(pin) || !Number.isInteger(parseInt(pin))) return undefined;
    const userInfo = {} as UsersDTO;
    userInfo.username = username;
    userInfo.pin = pin;
    const loginUser = this.loginService.getCurrentUser();
    if ( !_.isNil(loginUser) ) {
      if ( userInfo.username == loginUser.username) {
         return userInfo.pin == loginUser.pin?userInfo : undefined;
      }
    }
    return userInfo;
  }

  displaySignatureParseErrorMessage(signatureValue: string) {
    this.messageService.showSnackBar('Invalid entry, could not parse the signature. Ensure that you have entered your 521 ' +
    'followed by your six digit pin.', 'CLOSE');
    this.loggerService.warn('Could not parse signature given value', signatureValue);
  }
}
