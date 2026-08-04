import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AppConfigService } from './app-config-service.service';
import { saveAs } from 'file-saver';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoggerService} from '@app/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private snackBar: MatSnackBar,
    private loggerService: LoggerService,
  ) { }

  public downloadProcedureExport(procedureId: string): void {
    this.loggerService.info('Exporting runs for procedure with id ' + procedureId);
    this.handleServerCallForExport(`Export/procedure/${procedureId}`);
  }

  public initiateProgramExport(programPk: number): void {
    this.loggerService.info('Exporting runs for program with pk ' + programPk);
    this.snackBar.open('Program export has started. You will receive an email ' +
      'with a link to download the zip file once it has finished building. The process can take over an hour.', 'CLOSE')
    this.http.get<HttpResponse<any>>(
      `${this.configService.config.apiUrl}/Export/program/${programPk}`,
    );
  }

  public handleServerCallForExport(path: string, initialMessage?: string, errorMessage?: string, isProgramExportDownload?: boolean, programExportId?: string): void {
    if (isProgramExportDownload) {
      this.downloadProgramExport(path, programExportId);
      return;
    }
    const snackbar = this.snackBar.open(initialMessage ? initialMessage : `Beginning export download. Please wait.`, 'CLOSE');
    this.downloadFile(path)
      .then(() => snackbar.dismiss())
      .catch((response) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
          const text = e.srcElement;
          const message = (errorMessage ? errorMessage : 'Could not download export.') + ' ' + text['result'];
          this.loggerService.error(message);
          this.snackBar.open(message, 'OK');
        });
        reader.readAsText(response.error);
      });
  }


  private downloadProgramExport(path: string, programExportId: string): void {
    this.http.get(`${this.configService.config.apiUrl}/Export/programExportExists/${programExportId}`)
      .subscribe(result => {
        if (result) {
          const a = document.createElement('a');
          a.href = `${this.configService.config.apiUrl}/${path}`;
          a.click();
        } else {
          this.snackBar.open('Could not find an archive file for the given program export id. Are you sure the ID is correct ' +
            'and that the export file was created less than 24 hours ago? You can contact EPIC Support for assistance.', 'CLOSE');
        }
    })

  }

  /**
   * * Makes a call to the EPIC endpoint specified in `path`, downloads the file returned by the endpoint, and saves it to the client file system. The endpoint is expected to return a file.
   * @param path The EPIC endpoint. E.g. `Export/procedure/1`.
   */
  private downloadFile(path: string): Promise<void> {
    return this.http.get(
      `${this.configService.config.apiUrl}/${path}`,
      {
        observe: 'response',
        responseType: 'blob',
      },
      ).toPromise().then(res => {
      const cdHeader = res.headers.get('content-disposition');
      const filename = cdHeader.match(/filename = "(.+)"/)[1]; // Get first capture group.
      saveAs(res.body, filename);
    });
  }

  public downloadProcedureAttachments(procedureId: string) {
    this.loggerService.info('Downloading attachments for procedure id ' + procedureId);
    return this.handleServerCallForExport(`Export/procedure/${procedureId}/attachments`, 'Beginning attachments download. Please wait.',
      'Could not download attachments.', false);
  }

}
