import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {MessageService} from './message.service';
import {RunStepComment, StepDefDTO} from '../interfaces/step-def.dto.interface';
import {RunDTO} from '../interfaces/run.dto';
import {BlackLineDto, BlackLineEntityType} from '../interfaces/black-line.dto';
import {Run} from '../interfaces/Run';
import * as _ from 'lodash';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import {Users} from '@app/interfaces/users';
import {SecondSignature, SecondSignatureType} from '@app/interfaces/second-signature.dto';
import {LoginService} from '@app/services/login.service';
import {ProcedureDetailsDashboard} from '@app/interfaces/procedure-details-dashboard.dto';
import {RunDashboardDTO} from '@app/interfaces/run-dashboard.dto';
import {RunDashboard} from '@app/interfaces/RunDashboard';
import {RedLine} from '@app/interfaces/red-line.dto';
import {AppConfigService} from '@app/services/app-config-service.service';
import {ProgramDTO} from '@app/interfaces/program.dto';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {ProcedureApproval} from '@app/interfaces/procedure-approval.dto';
import {StepGroupDefDTO} from '@app/interfaces/step-group-def.dto';
import {RunApproval} from '@app/interfaces/run-approval.dto';
import {ProcedureDef} from '@app/interfaces/procedure-def.dto';
import {UsersDTO} from '@app/interfaces/users.dto';
import {ApprovalType} from '@app/interfaces/approval';
import {RunCloseoutComment, RunCloseoutCommentReply, RunCloseoutStickyComment, ApprovalComment, ApprovalCommentReply} from '@app/interfaces/comment.dto';
import {ProcedureListReportingDTO} from '@app/interfaces/procedure-list-reporting-dto';
import {RunListReportingDTO} from '@app/interfaces/run-list-reporting-dto';
import {EquipmentDTO} from '@app/interfaces/equipment.dto';
import {Utils} from '@app/utils';
import { Equipment } from '@app/interfaces/equipment';
import { StepDef } from '@app/interfaces/step-def.interface';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import { AllApprovalsDTO } from '@app/interfaces/all-approvals.dto';
import { CreateProcedureSelectionsDTO } from '@app/interfaces/create-procedure-selections.dto';
import { PACommentReplyDTO } from '@app/interfaces/pa-comment-reply.dto';
import { NewProcData } from '@app/interfaces/new-proc-data.type';
import { ApprovalWithProcedureDetails } from '@app/interfaces/approval-with-procedure-details';
import {LoggerService} from '@app/services/logger.service';
import { FindProcedureDTO } from '@app/interfaces/find-procedure-dto';
import {FindProcedure} from "@app/interfaces/find-procedure";
import { ProcedureDefAttributesDTO } from '@app/interfaces/procedure-def-attributes.dto';
import {CommunicationBanner} from "@app/components/admin/communication-banner-config/communication-banner-config.component";

export const httpJsonOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

export const httpTextOptions = {
  headers: new HttpHeaders({'Content-Type': 'text/plain'})
};

export const httpJsonPatchOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json-patch+json'})
};

@Injectable({
  providedIn: 'root'
})
export class EPICWSService {

  constructor(
    public http: HttpClient,
    private messageService: MessageService,
    private loginService: LoginService,
    public configService: AppConfigService,
    private loggerService: LoggerService
  ) {
  }

  /* dashboard related methods */
  getMyDrafts(): Observable<ProcedureDetailsDashboard[] & ErrMsg> {
    const params: _.Dictionary<string> = {username: this.loginService.currentUser.userName};
    return this.http.get<ProcedureDetailsDashboard[]>(`${this.configService.config.apiUrl}/MyDrafts/`, {params: params})
      .pipe(catchError(this.handleError<ProcedureDetailsDashboard[]>('getMyDrafts', [])));
  }

  getMyRuns(): Observable<RunDashboard[] & ErrMsg> {
    const params: _.Dictionary<string> = {username: this.loginService.currentUser.userName};
    return this.http.get<RunDashboardDTO[]>(`${this.configService.config.apiUrl}/Runs/MyRuns/`, {params: params})
      .pipe(catchError(this.handleError<RunDashboardDTO[]>('getMyRuns', [])))
      .pipe(map(runs => _.map(runs, r => new RunDashboard().loadFromDTO(r))));
  }

  getRun(runId: string): Observable<Run & ErrMsg> {
    return this.http.get<RunDTO>(`${this.configService.config.apiUrl}/Runs/Run/${runId}`)
      .pipe(catchError(this.handleError<RunDTO>('getRun')))
      .pipe(map(r => new Run().loadFromDTO(r)));
  }

  getRunByPk(runPk: number): Observable<Run & ErrMsg> {
    return this.http.get<RunDTO>(`${this.configService.config.apiUrl}/Runs/Run/pk/${runPk}`)
      .pipe(catchError(this.handleError<RunDTO>('getRunByPk')))
      .pipe(map(r => new Run().loadFromDTO(r)));
  }

  getMyApprovals(): Observable<AllApprovalsDTO & ErrMsg> {
    const params: _.Dictionary<string> = {username: this.loginService.currentUser.userName};
    return this.http.get<AllApprovalsDTO>(`${this.configService.config.apiUrl}/MyApprovals/`, {params: params})
      .pipe(catchError(this.handleError<AllApprovalsDTO>('getMyApprovals')));
  }

  /* Procedure transition related methods */
  transitionProcToWaiting(procDefVersionPk, dueDate: Date): Observable<ProcedureDetails & ErrMsg> {
    return this.http.post<ProcedureDetails>(`${this.configService.config.apiUrl}/TransitionProcedure/WAITING?pk=${procDefVersionPk}&dueDate=${dueDate.getTime()}`, httpTextOptions)
      .pipe(catchError(this.handleError<ProcedureDetails>('transitionProcToWaiting')));
  }

  transitionProcToReady(procDefVersionPk): Observable<ProcedureDetails & ErrMsg> {
    return this.http.post<ProcedureDetails>(`${this.configService.config.apiUrl}/TransitionProcedure/READY?pk=${procDefVersionPk}`, httpTextOptions)
      .pipe(catchError(this.handleError<ProcedureDetails>('transitionProcToReady')));
  }

  transitionProcToDraft(procDefVersionPk): Observable<ProcedureDetails & ErrMsg> {
    return this.http.post<ProcedureDetails>(`${this.configService.config.apiUrl}/TransitionProcedure/DRAFT?pk=${procDefVersionPk}`, httpTextOptions)
      .pipe(catchError(this.handleError<ProcedureDetails>('transitionProcToDraft')));
  }

  getCreateProcedureSelections(): Observable<CreateProcedureSelectionsDTO & ErrMsg> {
    return this.http.get<CreateProcedureSelectionsDTO>(`${this.configService.config.apiUrl}/CreateProcedure/`)
      .pipe(catchError(this.handleError<CreateProcedureSelectionsDTO>('getCreateProcedureSelections')));
  }

  createNewProcedure(newProcInfo): Observable<ProcedureDef & ErrMsg> {
    return this.http.post<ProcedureDef>(`${this.configService.config.apiUrl}/CreateProcedure/`, newProcInfo, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDef>('createNewProcedure')));
  }

  getProcedureDetailsByUniqueCode(procedureId): Observable<ProcedureDetails & ErrMsg> {
    return this.http.get<ProcedureDetailsDTO>(`${this.configService.config.apiUrl}/AuthorProcedure/?id=${procedureId}`, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDetailsDTO>('getProcedureDetailsByUniqueCode')))
      .pipe(map(elm => {
        const r = new ProcedureDetails().loadFromDTO(elm);
        _.set(r, 'error', elm['error']);
        return r;
      }));
  }

  changeProcedureAuthor(userId, procedureHeaderPk): Observable<UsersDTO & ErrMsg> {
    return this.http.post<UsersDTO>(`${this.configService.config.apiUrl}/SaveProcedureHeaderUserData/Author?userId=${userId}&procedureHeaderPk=${procedureHeaderPk}`, httpTextOptions)
      .pipe(catchError(this.handleError<UsersDTO>('changeProcedureAuthor')));
  }

  saveProcedureHeaderUserData(headerUserData): Observable<ProcedureApproval & ErrMsg> {
    return this.http.post<ProcedureApproval>(this.configService.config.apiUrl + '/SaveProcedureHeaderUserData/', headerUserData, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureApproval>('saveProcedureHeaderUserData')));
  }
  deleteProcedureHeaderApproval(approval: ProcedureApproval): Observable<boolean & Error> {
    return this.http.delete<boolean>(`${this.configService.config.apiUrl}/DeleteProcedureHeaderApproval/${approval.pk}`)
      .pipe(catchError(this.handleErrorFromWs<boolean>('deleteProcedureHeaderApproval')));
  }

  setProcedureApproverStatus(approval: ProcedureApproval, status: boolean): Observable<any & Error> {
    return this.http.post<ProcedureApproval>(`${this.configService.config.apiUrl}/MyApprovals/SetApproverDisabled/?pk=${approval.pk}&approverDisabled=${status}`, httpJsonOptions)
        .pipe(catchError(this.handleErrorFromWs<boolean>('setProcedureApproverStatus')));
  }

  setApproved(val: boolean | null, pk: number): Observable<ApprovalWithProcedureDetails & ErrMsg> {
    const valStr: string = (val === null) ? 'null' : '' + val;
    return this.http.post<ApprovalWithProcedureDetails>(`${this.configService.config.apiUrl}/TransitionProcedure/ApproveForRelease?pk=${pk}&approved=${valStr}`, httpTextOptions)
      .pipe(catchError(this.handleError<ApprovalWithProcedureDetails>('setApproved')));
  }

  saveProcedureApprovalComment(commentData: PACommentReplyDTO): Observable<ApprovalComment> {
    return this.http.post<ApprovalComment>(`${this.configService.config.apiUrl}/Comments/Approval`, commentData, httpJsonOptions)
      .pipe(catchError(this.handleError<ApprovalComment>('saveProcedureApprovalComment')));
  }

  /* Step Group related methods */
  saveStepGroupData(_stepGroup: StepGroupDef[], procedureDetailsPk: number): Observable<StepGroupDef[] & ErrMsg> {
    const stepGroup = _.map(_stepGroup, sg => sg.asDTO());
    return this.http.post<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/StepGroups/?procedureDetailsPk=${procedureDetailsPk}`, stepGroup, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO[]>('saveStepGroupData')))
      .pipe(map(elms => {
        const r = _.map(elms, elm => new StepGroupDef().loadFromDTO(elm));
        _.set(r, 'error', elms['error']);
        return r;
      }));
  }

  updateStepGroupData(_stepGroupDataArray: StepGroupDef[], procedureData: ProcedureDetails): Observable<StepGroupDef[] & ErrMsg> {
    const dtos = _.map(_stepGroupDataArray, elm => elm.asDTO());
    const stepGroupDataArray = Utils.makeStepGroupArrayJsonFriendly(dtos, procedureData.asDTO());
    return this.http.put<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/StepGroups/`, stepGroupDataArray, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO[]>('updateStepGroupData')))
      .pipe(map(res => {
        const r = _.map(res, elm => new StepGroupDef().loadFromDTO(elm));
        if (res) _.set(r, 'error', r['error']);
        return r;
      }));
  }

  patchStepGroupData(parentPk: number, isTopLevel: boolean, changesToMake: any[]): Observable<StepGroupDef[] & Error> {
    return this.http.patch<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/StepGroups/?parentPk=${parentPk}&isTopLevel=${isTopLevel}`, changesToMake, httpJsonPatchOptions)
      .pipe(catchError(this.handleErrorFromWs<StepGroupDefDTO[]>('patchStepGroupData')))
      .pipe(map(elms => {
        const r = _.map(elms, elm => new StepGroupDef().loadFromDTO(elm));
        if (elms) _.set(r, 'error', elms['error']);
        return r;
      }));
  }

  /* user related methods starting here */
  getAllUsers(): Observable<Users[] & ErrMsg> {
    return this.http.get<UsersDTO[]>(`${this.configService.config.apiUrl}/AllUsers/`)
    .pipe(catchError(this.handleError<UsersDTO[]>('getAllUsers')))
    .pipe(map(usersDto => _.map(usersDto, userDto => new Users().loadFromDTO(userDto))));
  }

  /**
   * This returns a list of matching users. This is defined in a different manner than the rest of the service methods so that it can be passed as an argument to our `singleAutompleteDialogComponent`.
   */
  getMatchingUsers = (searchTerm: string): Observable<Users[] & ErrMsg> => {
    return this.http.get<UsersDTO[]>(`${this.configService.config.apiUrl}/MatchingUsers/?searchTerm=${searchTerm}`, httpJsonOptions)
    .pipe(
      catchError(this.handleError<UsersDTO[]>('getMatchingUsers')),
    )
    .pipe(map(users => _.map(users, user => new Users().loadFromDTO(user))));
  }

  getUserByUserName(userName: string): Observable<Users & ErrMsg> {
    return this.http.get<UsersDTO>(`${this.configService.config.apiUrl}/AllUsers/${userName}`)
      .pipe(catchError(this.handleError<UsersDTO>('getUserByUserName')))
      .pipe(map(user => new Users().loadFromDTO(user)));
  }

  updateUserInformation(user: Users | UsersDTO): Observable<Users & ErrMsg> {
    const userDTO: UsersDTO = user instanceof Users ? user.asDTO() : user;
    return this.http.put<UsersDTO>(`${this.configService.config.apiUrl}/AllUsers/UpdateUserInfo/`, userDTO, httpJsonOptions)
      .pipe(catchError(this.handleError<UsersDTO>('updateUserInformation')))
      .pipe(map(userData => new Users().loadFromDTO(userData)));
  }

  generatePinForUser(user: Users | UsersDTO): Observable<Users & ErrMsg> {
    const userDTO: UsersDTO = user instanceof Users ? user.asDTO() : user;
    return this.http.post<UsersDTO>(`${this.configService.config.apiUrl}/AllUsers/GenerateNewPin/`, userDTO, httpJsonOptions)
      .pipe(catchError(this.handleError<UsersDTO>('generateNewPin')))
      .pipe(map(userData => new Users().loadFromDTO(userData)));
  }

  getStepGroupDefs(procedureDetailsPk: number): Observable<StepGroupDef[] & ErrMsg> {
    return this.http.get<StepGroupDefDTO>(`${this.configService.config.apiUrl}/StepGroups/?procedureDetailsPk=${procedureDetailsPk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO>('getStepGroupDefs')))
      .pipe(map(sgds => _.map(sgds, (sgd: StepGroupDefDTO) => new StepGroupDef().loadFromDTO(sgd))));
  }

  /**
   * TODO: Convert `procedureSearchParameters` to be typed, and use http parameters rather than raw string appending and a builder in `ProceduresearchComponent`.
   * @param procedureSearchParameters A query string to be appended to the request URL.
   */
  getProcedureSearchResults(procedureSearchParameters: string): Observable<FindProcedure> & ErrMsg {
    return this.http.get<FindProcedureDTO>(`${this.configService.config.apiUrl}/FindProcedures/?${procedureSearchParameters}`, httpJsonOptions)
      .pipe(catchError(this.handleError<FindProcedureDTO>('getProcedureSearchResults')))
      .pipe(map(fp => new FindProcedure().loadFromDTO(fp)));
  }

  getProcedureDefSearchResults(procedureDefSearchParameters: string): Observable<FindProcedure> & ErrMsg {
    return this.http.get<FindProcedureDTO>(`${this.configService.config.apiUrl}/FindProcedureDefs/?${procedureDefSearchParameters}`, httpJsonOptions)
      .pipe(catchError(this.handleError<FindProcedureDTO>('getProcedureSearchResults')))
      .pipe(map(fp => new FindProcedure().loadFromDTO(fp)));
  }

  cloneProcedure(procedureInfo: { procedureDetailsPk: number, procedureDef: NewProcData}): Observable<ProcedureDef & ErrMsg> {
    return this.http.post<ProcedureDef>(`${this.configService.config.apiUrl}/CloneProcedure/`, procedureInfo, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDef>('cloneProcedure')));
  }

  updateProcedureDefAttributes(id: number, name: string = '', description: string = ''): Observable<ProcedureDef & Error> {
    const procedureDefData = {
      id: id,
      name: name,
      description: description
    } as ProcedureDefAttributesDTO;
    return this.http.post<ProcedureDef & Error>(`${this.configService.config.apiUrl}/ProcedureDefinition/ChangeProcedureDefAttributes`, procedureDefData, httpJsonOptions)
      .pipe(catchError(this.handleErrorFromWs<ProcedureDef>('updateProcedureDefAttributes')));
  }

  updateProcedureHazardDetails(pk: number, isHazardous: boolean, hazardDescription: string): Promise<ProcedureDetails & ErrMsg> {
    return this.httpPut<ProcedureDetailsDTO>(`ProcedureDetails/Hazard`, null, {pk, isHazardous, hazardDescription})
      .then(res => {
        if (!res['error']) {
          return new ProcedureDetails().loadFromDTO(res);
        } else {
          const pDetail = new ProcedureDetails();
          pDetail['error'] = res['error'];
          return pDetail;
        }
      });
  }

  public updateProcedureDetailsEsd0(pk: number, val: boolean): Promise<ProcedureDetails> {
    return this.httpPut<ProcedureDetailsDTO>(`ProcedureDetails/Esd0`, null, {pk, val})
      .then(res => new ProcedureDetails().loadFromDTO(res));
  }

  getProcedureDefByPk(pk: number): Observable<ProcedureDef> {
    return this.http.get<ProcedureDef>(`${this.configService.config.apiUrl}/ProcedureDefinition/?pk=${pk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDef>('getProcedureDefByPk')));
  }

  getProcedureDetailsByPk(pk: number): Observable<ProcedureDetails> {
    return this.http.get<ProcedureDetails>(`${this.configService.config.apiUrl}/ProcedureDetails/?pk=${pk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDetails>('getProcedureDetailsByPk')));
  }

  /* Step related methods starting here */
  copyStepToGroup(stepPk, stepGroupPk): Observable<StepDef & ErrMsg> {
    return this.http.post<StepDefDTO>(`${this.configService.config.apiUrl}/Clone/StepToGroup?stepPk=${stepPk}&groupPk=${stepGroupPk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO>('copyStepToGroup')))
      .pipe(map(elm => {
        const sd = new StepDef().loadFromDTO(elm);
        sd.setStepGroupDef(elm.stepGroupDef);
        _.set(sd, 'error', elm['error']);
        return sd;
      }));
  }

  changeStepType(stepPk, stepType): Observable<StepDef & ErrMsg> {
    return this.http.post<StepDefDTO>(`${this.configService.config.apiUrl}/Clone/ChangeStepType?stepPk=${stepPk}&stepType=${stepType}`, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO>('changeStepType')))
      .pipe(map(elm => {
        const sd = new StepDef().loadFromDTO(elm);
        sd.setStepGroupDef(elm.stepGroupDef);
        _.set(sd, 'error', elm['error']);
        return sd;
      }));
  }

  copyGroupToGroup(groupPk, parentGroupPk, procedurePk): Observable<StepGroupDef & ErrMsg> {
    return this.http.post<StepGroupDefDTO>(`${this.configService.config.apiUrl}/Clone/GroupToGroup?groupPk=${groupPk}&parentGroupPk=${parentGroupPk}&procedurePk=${procedurePk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO>('copyGroupToGroup')))
      .pipe(map(elm => {
        const sd = new StepGroupDef().loadFromDTO(elm);
        _.set(sd, 'error', elm['error']);
        return sd;
      }));
  }

  cloneStepsToNewProcedure(_steps: StepDef[], _groups: StepGroupDef[], procedureDetailsPk: number, parentGroupPk: number): Observable<StepGroupDef[] & ErrMsg> {
    const steps = _.map(_steps, step => step.asDTO());
    const groups = _.map(_groups, group => group.asDTO());
    return this.http.post<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/Clone/StepsToNewProcedure?procedureDetailsPk=${procedureDetailsPk}&parentGroupPk=${parentGroupPk}`, {steps: steps, groups: groups}, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO[]>('cloneStepsToNewProcedure')))
      .pipe(map(elms => {
        const sds = _.map(elms, elm => new StepGroupDef().loadFromDTO(elm));
        _.set(sds, 'error', elms['error']);
        return sds;
      }));
  }

  saveStepData(_stepData: StepDef): Observable<StepDef & ErrMsg> {
    const stepData = _stepData.asDTO();
    return this.http.post<StepDefDTO>(`${this.configService.config.apiUrl}/ProcessStepData/${stepData.type}/`, stepData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO>('saveStepData')))
      .pipe(map(sd => {
        const ret = new StepDef().loadFromDTO(sd);
        ret.setStepGroupDef(sd.stepGroupDef);
        if (sd) _.set(ret, 'error', sd['error']);
        return ret;
      }));
  }

  updateStepData(_stepData: StepDef[], updateTables: boolean): Observable<StepDef[] & ErrMsg> {

    const stepData = _.map(_stepData, s => s.asDTO());

    // FIXME: We've just mapped the steps to be saved to a DTO, this shouldn't be necessary.
    // // Ensure we don't have any circular references that can't be serialized.
    // stepData.forEach( step => step.stepGroupDef = {pk: step.stepGroupDef.pk} );

    return this.http.put<StepDefDTO[]>(`${this.configService.config.apiUrl}/ProcessStepData/?updateTables=${updateTables}`, stepData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO[]>('updateStepData')))
      .pipe(map(elms => {
        const sds = _.map(elms, elm => {
          const sd = new StepDef().loadFromDTO(elm);
          sd.setStepGroupDef(elm.stepGroupDef);
          return sd;
        });
        if (elms) _.set(sds, 'error', elms['error']);
        return sds;
      }));
  }

  deleteStep(stepPk: number): Observable<boolean & ErrMsg> {
    return this.http.delete<boolean>(`${this.configService.config.apiUrl}/ProcessStepData/${stepPk}`)
      .pipe(catchError(this.handleError<boolean>('deleteStep')));
  }

  /* Run related methods starting here */
  createNewRun(procedureDetailsPk: number, runNumber: number, runDefinition: RunDTO): Observable<ProcedureDetails> {
    return this.http.post<ProcedureDetailsDTO>(`${this.configService.config.apiUrl}/Runs/?pdvPk=${procedureDetailsPk}&runNumber=${runNumber}`, runDefinition, httpJsonOptions)
      .pipe(catchError(this.handleError<ProcedureDetailsDTO>('createNewRun')))
      .pipe(map(res => {
        const ret = new ProcedureDetails().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  saveNewRunStepComment(stepPk: number, runStepComment: RunStepComment): Observable<RunStepComment & ErrMsg> {
    return this.http.post<RunStepComment>(`${this.configService.config.apiUrl}/Comments/RunStep/?stepPk=${stepPk}`, runStepComment, httpJsonOptions)
      .pipe(catchError(this.handleError<RunStepComment>('saveRunStepComment')));
  }

  saveNewBlackLines(blackLines: BlackLineDto[], entityType: BlackLineEntityType, isStepManualValidation: boolean): Observable<BlackLineDto[] & Error> {
    _.forEach(blackLines, blackLine => {
      if (blackLine.procedureDetails) _.set(blackLine, 'procedureDetails', {
        pk: blackLine.procedureDetails.pk,
      });
    })
    return this.http.post<BlackLineDto[]>(`${this.configService.config.apiUrl}/Comments/BlackLine/?entityType=${entityType}&isStepManualValidation=${isStepManualValidation}`,
      blackLines, httpJsonOptions)
      .pipe(catchError(this.handleError<BlackLineDto[]>('saveBlackLine')));
  }

  saveSecondSignature(secondSignature: SecondSignature): Promise<StepDef | ErrMsg> {
    if (secondSignature.type === SecondSignatureType.BLACK_RED_LINE) {
      this.loggerService.error('Cannot use `EpicWSService.saveSecondSignature()` to save signatures of type `BLACK_RED_LINE`. Use `EpicWSService.saveBlackRedLineSignature()` instead!');
      return;
    }
    return this.httpPost<StepDefDTO & ErrMsg>(`SecondSignature/RunStepSecondSignature/`, secondSignature)
      .then(step => {
        if (step.error) return step;
        return new StepDef().loadFromDTO(step);
      });
  }

  checkForUniqueRunName(runName: string): Observable<boolean & Error> {
    return this.http.get<boolean>(`${this.configService.config.apiUrl}/Runs/UniqueName/?runName=${runName}`)
      .pipe(catchError(this.handleErrorFromWs<boolean>('checkForUniqueRunName')));
  }

  toggleProcedureFavorite(procedureDetailPk: number, isSave: boolean): Observable<UsersDTO & ErrMsg> {
    return this.http.post<UsersDTO>(`${this.configService.config.apiUrl}/ProcedureFavorites/Toggle/?procedureDetailPk=${procedureDetailPk}&isSave=${isSave}`, httpJsonOptions)
      .pipe(catchError(this.handleError<UsersDTO>('toggleProcedureFavorite')));
  }

  saveRunApprover(userId: number, approvalType: ApprovalType, runPk: number, approverOrder: number): Observable<RunApproval & ErrMsg> {
    return this.http.post<RunApproval>(`${this.configService.config.apiUrl}/MyApprovals/AddRunApproval/?userId=${userId}&approvalType=${approvalType}&runPk=${runPk}&approverOrder=${approverOrder}`, httpJsonOptions)
      .pipe(catchError(this.handleError<RunApproval>('saveRunApprover')));
  }

  deleteRunApprover(runApprovalPk: number): Observable<RunApproval[] & ErrMsg> {
    return this.http.delete<RunApproval[]>(`${this.configService.config.apiUrl}/MyApprovals/DeleteRunApproval?runApprovalPk=${runApprovalPk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<RunApproval[]>('deleteRunApprover')));
  }

  updateRunApprovers(runPk: number, runApprovals: RunApproval[]): Observable<RunApproval[] & ErrMsg> {
    return this.http.put<RunApproval[]>(`${this.configService.config.apiUrl}/MyApprovals/UpdateRunApprovals?runPk=${runPk}`, runApprovals, httpJsonOptions)
      .pipe(catchError(this.handleError<RunApproval[]>('updateRunApprovers')));
  }

  submitRunForCloseoutAndTransitionToReviewing(runPk: number): Observable<Run & ErrMsg> {
    return this.http.put<RunDTO>(`${this.configService.config.apiUrl}/Runs/TransitionRunToReviewing?runPk=${runPk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<RunDTO>('submitRunForCloseoutAndTransitionToReviewing')))
      .pipe(map(res => {
        const ret = new Run().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  transitionRunToCorrecting(runPk: number, onlyAdminCanTransition: boolean): Observable<Run & ErrMsg> {
    return this.http.put<RunDTO>(`${this.configService.config.apiUrl}/Runs/TransitionRunToCorrecting?runPk=${runPk}&onlyAdminCanTransition=${onlyAdminCanTransition}`, httpJsonOptions)
      .pipe(catchError(this.handleError<RunDTO>('transitionRunToCorrecting')))
      .pipe(map(res => {
        const ret = new Run().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  transitionRunToCompleted(runPk: number): Observable<Run & ErrMsg> {
    return this.http.put<RunDTO>(`${this.configService.config.apiUrl}/Runs/TransitionRunToCompleted?runPk=${runPk}`, httpJsonOptions)
      .pipe(catchError(this.handleError<RunDTO>('transitionRunToCompleted')))
      .pipe(map(res => {
        const ret = new Run().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  submitRunApprovalDecision(approval: RunApproval): Observable<Run & ErrMsg> {
    return this.http.put<RunDTO>(`${this.configService.config.apiUrl}/MyApprovals/RecordRunApprovalDecision`, approval, httpJsonOptions)
      .pipe(catchError(this.handleError<RunDTO>('submitRunApprovalDecision')))
      .pipe(map(res => {
        const ret = new Run().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  submitRunCloseoutComment(comment: RunCloseoutComment): Observable<RunCloseoutComment & ErrMsg> {
    return this.http.post<RunCloseoutComment>(`${this.configService.config.apiUrl}/Comments/RunCloseout`, comment, httpJsonOptions)
      .pipe(catchError(this.handleError<RunCloseoutComment>('submitRunCloseoutComment')));
  }

  submitRunCloseoutCommentReply(reply: RunCloseoutCommentReply): Observable<RunCloseoutCommentReply & ErrMsg> {
    return this.http.post<RunCloseoutCommentReply>(`${this.configService.config.apiUrl}/Comments/RunCloseoutReply`, reply, httpJsonOptions)
      .pipe(catchError(this.handleError<RunCloseoutCommentReply>('submitRunCloseoutCommentReply')));
  }

  submitRunCloseoutStickyComment(sticky: RunCloseoutStickyComment): Observable<RunCloseoutStickyComment & ErrMsg> {
    return this.http.post<RunCloseoutStickyComment>(`${this.configService.config.apiUrl}/Comments/RunCloseoutStickyComment`, sticky, httpJsonOptions)
      .pipe(catchError(this.handleError<RunCloseoutStickyComment>('submitRunCloseoutStickyComment')));
  }

  markRunCloseoutStickyAsCompleteAndDelete(sticky: RunCloseoutStickyComment): Observable<RunCloseoutStickyComment & ErrMsg> {
    return this.http.put<RunCloseoutStickyComment>(`${this.configService.config.apiUrl}/Comments/RunCloseoutStickyComment`, sticky, httpJsonOptions)
      .pipe(catchError(this.handleError<RunCloseoutStickyComment>('submitRunCloseoutStickyComment')));
  }

  /* red line related methods starting here */
  checkIfRedLineAllowed(runId: string): Observable<boolean & ErrMsg> {
    return this.http.get<boolean>(`${this.configService.config.apiUrl}/Redline/Allowed/?id=${runId}`, httpJsonOptions)
      .pipe(catchError(this.handleError<boolean>('checkIfRedLineAllowed')));
  }

  saveRedLineToStepGroup(redLineData: RedLine, procedureData: ProcedureDetails): Observable<StepGroupDef & ErrMsg> {

    // TODO: Verify this works correctly.
    // TODO: Is this necessary, or can/should it be handled in `StepGroupDef.asDTO()`?
    redLineData.stepGroupDef = Utils.makeStepGroupArrayJsonFriendly([_.cloneDeep(redLineData.stepGroupDef)], procedureData.asDTO())[0];
    if (redLineData.stepGroupDef.procedureDetails !== null) {
      delete redLineData.stepGroupDef.procedureDetails.redliningEnabled;
      delete redLineData.stepGroupDef.procedureDetails.run;
    }

    return this.http.post<StepGroupDefDTO>(`${this.configService.config.apiUrl}/Redline/StepGroup/`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO>('saveRedLineToStepGroup')))
      .pipe(map(elm => {
        const r = new StepGroupDef().loadFromDTO(elm);
        _.set(r, 'error', elm['error']);
        return r;
      }));
  }

  saveRedLineArrayToStepGroup(_redLineData: RedLine[]): Observable<StepGroupDef[] & ErrMsg> {
    const redLineData = _.cloneDeep(_redLineData);
    redLineData.forEach(rl => {
      Utils.makeStepGroupArrayJsonFriendly([rl.stepGroupDef], {pk: rl.procedureDetailsPk} as ProcedureDetailsDTO);
    });

    return this.http.post<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/Redline/StepGroupArray/`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO[]>('saveRedLineArrayToStepGroup')))
      .pipe(map(elms => {
        if (!elms) return;
        const r = _.map(elms, elm => new StepGroupDef().loadFromDTO(elm));
        _.set(r, 'error', elms['error']);
        return r;
      }));
  }

  saveStepArrayAsRedLines(redLineData: RedLine[]): Observable<StepDef[] & ErrMsg> {

    // Ensure we don't have any circular references that can't be serialized.
    _.map(redLineData, rl => {
      if (rl.stepGroupDef) rl.stepGroupDef = {pk: rl.stepGroupDef.pk};
      if (rl.stepDef.stepGroupDef) rl.stepDef.stepGroupDef = {pk: rl.stepDef.stepGroupDef.pk};
    });

    return this.http.post<StepDefDTO[]>(`${this.configService.config.apiUrl}/Redline/StepArray/`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO[]>('saveStepArrayAsRedLines')))
      .pipe(map(elms => {
        const sds = _.map(elms, elm => {
          const sd = new StepDef().loadFromDTO(elm);
          sd.setStepGroupDef(elm.stepGroupDef);
          return sd;
        });
        _.set(sds, 'error', elms['error']);
        return sds;
      }));
  }

  saveCopiedStepAsRedLine(redLineData: RedLine): Observable<StepDef & ErrMsg> {
    return this.http.post<StepDefDTO>(`${this.configService.config.apiUrl}/Redline/CopyStep`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepDefDTO>('saveCopiedStepAsRedLine')))
      .pipe(map(res => {
        const sd = new StepDef().loadFromDTO(res);
        sd.setStepGroupDef(res.stepGroupDef);
        if (sd) _.set(sd, 'error', sd['error']);
        return sd;
      }));
  }

  saveCopiedStepGroupAsRedLine(redLineData: RedLine, parentGroupPk: number): Observable<StepGroupDef & ErrMsg> {
    return this.http.post<StepGroupDefDTO>(`${this.configService.config.apiUrl}/Redline/CopyStepGroup?parentGroupPk=${parentGroupPk}`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO>('saveCopiedStepGroupAsRedLine')))
      .pipe(map(res => {
        const ret = new StepGroupDef().loadFromDTO(res);
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  saveMultipleCopiedStepsAsRedLines(redLineData: RedLine): Observable<StepGroupDef[] & ErrMsg> {
    return this.http.post<StepGroupDefDTO[]>(`${this.configService.config.apiUrl}/Redline/CopyMultipleSteps`, redLineData, httpJsonOptions)
      .pipe(catchError(this.handleError<StepGroupDefDTO[]>('saveMultipleCopiedStepsAsRedLines')))
      .pipe(map(res => {
        const ret = _.map(res, r => new StepGroupDef().loadFromDTO(r));
        if (res) _.set(ret, 'error', res['error']);
        return ret;
      }));
  }

  saveHazardInfoAsRedLine(redLineData: RedLine, isHazardous: boolean, hazardDescription: string, isEsd0: boolean): Promise<ProcedureDetails & ErrMsg> {
    return this.httpPut<any>(`Redline/HazardUpdate`, redLineData, {isHazardous, hazardDescription, isEsd0})
      .then(result => {
        if (result.error) return result;
        return new ProcedureDetails().loadFromDTO(result)
      });
  }

  public getPrograms(): Promise<ProgramDTO[]> {
    return this.httpGet<ProgramDTO[]>('programs');
  }

  public createProcedureRevision(procedureId: string): Promise<ProcedureDetails> {
    return this.httpPost<ProcedureDetailsDTO>('ProcedureDetails/CreateRevision', null, { id: procedureId })
      .then(res => new ProcedureDetails().loadFromDTO(res));
  }

  /* reporting methods starting here */
  public getAllProceduresReport(programPk: number, subsystemPk: number): Promise<ProcedureListReportingDTO[] & ErrMsg> {
    return this.httpGet<ProcedureListReportingDTO[]>('Reports/AllProcedures', {programPk: programPk ? programPk : '', subsystemPk: subsystemPk ? subsystemPk : ''});
  }

  public getAllRunsReport(programPk: number, subsystemPk: number, testingPhasePk: number, getNonConformance: boolean): Promise<RunListReportingDTO[] & Error> {
    return this.httpGet<RunListReportingDTO[]>('Reports/AllRuns', {programPk: programPk ? programPk : '', subsystemPk: subsystemPk ? subsystemPk : '', testingPhasePk: testingPhasePk ? testingPhasePk : '',
      getNonConformance: getNonConformance});
  }

  public getAllEquipmentReport(programPk: number, subsystemPk: number, testingPhasePk: number): Promise<Equipment[] & ErrMsg> {
    return this.httpGet<EquipmentDTO[]>('Reports/AllEquipment', {programPk: programPk ? programPk : '', subsystemPk: subsystemPk ? subsystemPk : '', testingPhasePk: testingPhasePk ? testingPhasePk : ''})
      .then(retList => _.map(retList, eq => new Equipment().loadFromDTO(eq)));
  }

  public getRunsForEquipment(equipmentPropertyNumber: string, equipmentSerialNumber: string): Promise<RunListReportingDTO[] & ErrMsg> {
    return this.httpGet<RunListReportingDTO[]>('Reports/RunsForEquipment', {equipmentPropertyNumber: equipmentPropertyNumber, equipmentSerialNumber: equipmentSerialNumber});
  }

  public getCommunicationBanner(): Observable<CommunicationBanner> {
    return this.http.get<CommunicationBanner>(`${this.configService.config.apiUrl}/Communication/GetBanner`);
  }

  public postCommunicationBanner(communicationBanner: CommunicationBanner): Promise<any> {
    return this.httpPost<any>('Communication/PostBanner', communicationBanner);
  }

  public removeCommunicationBanner(): Promise<any> {
    return this.httpDelete<any>('Communication/RemoveBanner');
  }


  private handleError<T>(operation = 'operation', result?: T, duration = 0) {
    return (error: any): Observable<T & ErrMsg> => {
      this.loggerService.error(error);
      const errMsg = typeof error.error === 'string' ? error.error : (error.error.errorMessage ? error.error.errorMessage : error.message);
      this.messageService.showSnackBar(errMsg, 'CLOSE', duration);
      this.loggerService.error(`${operation} failed:`, errMsg);
      return of(result as T);
    };
  }

  // TODO: Potentially update all error handling to use this method and the error object instead of ErrMsg
  // Method that handles the Error object sent from the web service
  public handleErrorFromWs<T>(operation = 'operation', result?: T, duration = 0) {
    return (error: any): Observable<T & Error> => {
      this.loggerService.error(error.error.errorMessage);
      this.messageService.showSnackBar(error.error.errorMessage, 'CLOSE', duration);
      this.loggerService.error('${operation} failed: ', error.error.errorMessage);
      return of(error.error);
    };
  }

  public httpGet<T>(
    path: string,
    params?: { [key: string]: any },
  ): Promise<T> {
    return this.http
      .get(`${this.configService.config.apiUrl}/${path}`, {
        params: params,
      }).pipe(catchError(this.handleError<any>())).toPromise();
  }

  public httpPost<T>(
    path: string,
    body: any,
    params?: { [key: string]: any },
  ): Promise<T> {
    return this.http
      .post<T>(`${this.configService.config.apiUrl}/${path}`, body, {
        params: params,
      }).pipe(catchError(this.handleError<any>())).toPromise();
  }

  public httpPut<T>(
    path: string,
    body: any,
    params?: { [key: string]: any },
  ): Promise<T> {
    return this.http
      .put<T>(`${this.configService.config.apiUrl}/${path}`, body, {
        params: params,
      }).pipe(catchError(this.handleError<any>())).toPromise();
  }

  public httpDelete<T>(
    path: string,
    queryParams?: {[key: string]: string|number},
    body?: any,
  ): Promise<T> {
    let params = new HttpParams();
    _.forEach(queryParams, (val, key) => {
      params = params.append(key, _.toString(val));
    });
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body,
      params,
    };
    return this.http
      .delete<T>(`${this.configService.config.apiUrl}/${path}`, options)
      .pipe(catchError(this.handleError<any>())).toPromise();
  }


}

export interface ErrMsg {
  error?: string;
}

// Matches Error object returned by the WS
export interface Error {
  statusCode?: number;
  statusDescription?: string;
  errorMessage?: string;
}
