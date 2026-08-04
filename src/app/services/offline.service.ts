import {ApplicationRef, Injectable} from '@angular/core';
import {interval, Subject} from 'rxjs';
import {first, switchMap} from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {HealthcheckDTO} from '@app/interfaces/healthcheck.dto';
import {AppConfigService} from '@app/services/app-config-service.service';
import {LoggerService} from '@app/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {

  private clientPingIntervalMS: number = 1000;
  private serverPingIntervalMS: number = 10 * 1000;

  private _offline: boolean = false;
  get offline() { return this._offline; }
  private _serverOffline: boolean = false;
  get serverOffline() { return this._serverOffline; }
  public clientOffline: boolean = false;

  public offlineSubject: Subject<boolean> = new Subject<boolean>();
  public serverOfflineSubject: Subject<boolean> = new Subject<boolean>();

  private _statusExplanation: string = '';
  public get statusExplanation(): string {
    return this._statusExplanation;
  }

  constructor(
    private applicationRef: ApplicationRef,
    private http: HttpClient,
    private configService: AppConfigService,
    private loggerService: LoggerService
  ) {

    // Poll client status:
    this.updateClientOfflineStatus();
    this.applicationRef.isStable.pipe(
      first(stable => stable),
      switchMap(() => interval(this.clientPingIntervalMS)),
    ).subscribe(() => {
      this.updateClientOfflineStatus();
    });

    // Poll server status:
    this.updateServerOfflineStatus();
    this.applicationRef.isStable.pipe(
      first(stable => stable),
      switchMap(() => interval(this.serverPingIntervalMS)),
    ).subscribe(() => {
      if (!this.clientOffline) this.updateServerOfflineStatus();
    });

  }

  set offline(newStatus: boolean) {
    const prevStatus = this.offline;
    this._offline = newStatus;
    this.updateStatusExplanation();
    if (prevStatus !== this._offline) this.offlineSubject.next(this._offline);
    this.applicationRef.tick();  // Update Angular.
  }

  private updateOfflineStatus() {
    this.offline = this.clientOffline || this.serverOffline;
  }

  set serverOffline(newStatus: boolean) {
    const prevStatus = this.offline;
    this._serverOffline = newStatus;
    if (prevStatus !== newStatus) {
      this.updateOfflineStatus();
      this.serverOfflineSubject.next(this._serverOffline);
    }
  }

  private updateClientOfflineStatus(): void {
    this.clientOffline = !navigator.onLine;
    this.updateOfflineStatus();
  }

  private updateServerOfflineStatus(): void {
    this.http.get<HealthcheckDTO>(`${this.configService.config.apiUrl}/Healthcheck/`, {headers: new HttpHeaders({'Content-Type': 'text/plain'})})
      .pipe(first())
      .subscribe(
        res => this.serverOffline = !res.alive,
        error => this.serverOffline = true,
      );
  }

  private updateStatusExplanation(): void {
    let message = '';
    if (!this.offline) message = 'You\'re online! ';

    message = '';
    if (this.clientOffline) message += 'You\'re not connected to the internet. ';
    if (this.serverOffline) message += 'The EPIC server cannot be reached. ';

    this._statusExplanation = message;
    if (this.loggerService.logger && message) {
      this.loggerService.info(message);
    }
  }

}
