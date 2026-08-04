import {Injectable, Injector} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {IAppConfig} from '@app/interfaces/IAppConfig';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  public config: IAppConfig;

  constructor(
    private http: HttpClient,
  ) {
  }

  loadConfig() {
    const jsonFile = `assets/data/app-config.json`;
    return this.http.get(jsonFile).pipe(tap((returnedConfig) => {
        this.config = <IAppConfig>returnedConfig;
      })
    ).toPromise();
  }
}
