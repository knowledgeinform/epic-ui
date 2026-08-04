import { Injectable } from "@angular/core";

@Injectable()
export class LoggerServiceMock {
  info(): void {}
  warn(): void {}
  error(): void {}
}
