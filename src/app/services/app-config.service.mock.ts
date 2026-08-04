import { IAppConfig } from '@app/interfaces/IAppConfig';
import { Injectable } from "@angular/core";

@Injectable()
export class AppConfigServiceMock {
  public config: IAppConfig = {
    apiUrl: '',
  };
  loadConfig(): Promise<Object> {
    return Promise.resolve(this.config);
  }
}
