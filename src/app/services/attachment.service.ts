import { Injectable } from '@angular/core';
import {EPICWSService, ErrMsg, Error} from '@app/services/epic-ws.service';
import {Attachment} from '@app/interfaces/attachment';
import {StepDef} from '@app/interfaces/step-def.interface';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {Run} from '@app/interfaces/Run';
import {RunDTO} from '@app/interfaces/run.dto';
import {Observable} from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {RedLineComment} from '@app/interfaces/comment.dto';
import { AppConfigService } from './app-config-service.service';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  constructor(private epicWs: EPICWSService,
              private configService: AppConfigService) { }

  /**
   * Use this method to save StepDef and Procedure Attachments
   */
  public saveAttachment(formData: FormData): Observable<Attachment & Error> {
    return this.epicWs.http.post<Attachment>(`${this.configService.config.apiUrl}/Attachments/Save/`, formData)
      .pipe(catchError(this.epicWs.handleErrorFromWs<Attachment>('saveAttachment')));
  }

  /**
   * Use this method to save Run Step Attachments.
   */
  public saveRunStepAttachment(formData: FormData): Observable<StepDef & Error> {
    return this.epicWs.http.post<StepDefDTO>(`${this.configService.config.apiUrl}/Attachments/Save/`, formData)
      .pipe(catchError(this.epicWs.handleErrorFromWs<StepDefDTO>('saveRunStepAttachment')))
      .pipe(map(result => {
        return new StepDef().loadFromDTO(result);
      }));
  }

  /**
   * Use this method to save Run Attachments
   */
  public saveRunAttachment(formData: FormData): Observable<Run & Error> {
    return this.epicWs.http.post<RunDTO>(`${this.configService.config.apiUrl}/Attachments/Save/`, formData)
      .pipe(catchError(this.epicWs.handleErrorFromWs<RunDTO>('saveRunAttachment')))
      .pipe(map(result => {
        return new Run().loadFromDTO(result);
      }));
  }

  /**
   * Method for deleting Procedure and Step Def attachments.
   */
  public deleteAttachment(pk: number): Observable<null & Error> {
    return this.epicWs.http.delete<null>(`${this.configService.config.apiUrl}/Attachments/Delete/?pk=${pk}`)
      .pipe(catchError(this.epicWs.handleErrorFromWs<null>('deleteAttachment')));
  }

  /**
   * Method for deleting Run Step Attachments
   */
  public deleteRunStepAttachment(pk: number): Observable<StepDef & Error> {
    return this.epicWs.http.delete<StepDefDTO>(`${this.configService.config.apiUrl}/Attachments/Delete/?pk=${pk}`)
      .pipe(catchError(this.epicWs.handleErrorFromWs<StepDefDTO>('deleteRunStepAttachment')))
      .pipe(map(result => {
        return new StepDef().loadFromDTO(result);
      }));
  }

  /**
   * Method for delete Run attachments
   */
  public deleteRunAttachment(pk: number): Observable<Run & Error> {
    return this.epicWs.http.delete<RunDTO>(`${this.configService.config.apiUrl}/Attachments/Delete/?pk=${pk}`)
      .pipe(catchError(this.epicWs.handleErrorFromWs<RunDTO>('deleteRunAttachment')))
      .pipe(map(result => {
        return new Run().loadFromDTO(result);
      }));
  }

  public downloadAttachment(pk: number): Observable<HttpResponse<Blob> & Error> {
    return this.epicWs.http.get<Blob>(`${this.epicWs.configService.config.apiUrl}/Attachments/Download/?pk=${pk}`, {observe: 'response', responseType: 'blob' as 'json'})
      .pipe(catchError(this.epicWs.handleErrorFromWs<HttpResponse<Blob>>('downloadAttachment')));
  }

  public updateAttachmentAsRedLineDelete(pk: number, redLineComment: RedLineComment): Observable<null & Error> {
    return this.epicWs.http.put<null & ErrMsg>(`${this.configService.config.apiUrl}/Attachments/RedLineDelete/?pk=${pk}`, redLineComment)
      .pipe(catchError(this.epicWs.handleErrorFromWs<null>('updateAttachmentAsRedLineDelete')));
  }

  /**
   * Fetches the maximum allowed attachment size in bytes from the backend.
   */
  public getMaxUploadSize(): Observable<string> {
    // Adjust the URL path to match your backend routing configuration
    return this.epicWs.http.get<string>(`${this.epicWs.configService.config.apiUrl}/Attachments/MaxUploadSize`);
  }
}
