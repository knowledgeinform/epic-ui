import {Inject, Injectable} from '@angular/core';
import {JL} from 'jsnlog';
import {LoginService} from '@app/services/login.service';
import {environment} from '../../environments/environment';
import {AppConfigService} from '@app/services/app-config-service.service';
import {UserAuthDTO} from '@app/interfaces/user-auth.dto';


@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  JL: JL.JSNLog;
  public logger = null;
  appender;
  private allLoggers = [];
  private allAppenders = [];

  constructor(@Inject('JSNLog') jsnLog: JL.JSNLog,
              public loginService: LoginService,
              private configService: AppConfigService) {
    this.JL = jsnLog;
    this.createAndConfigureLogger(this.loginService.currentUser);
  }

  createAndConfigureLogger(user: UserAuthDTO): void {
    if (!user) return;

    // set up the logger with the name of the current user. This logger name gets included in the messages going to the server.
    if (this.logger && this.logger.loggerName === user.userName) return;

    const existingLogger = this.allLoggers.filter(l => l.loggerName === user.userName)[0];
    const username = user.userName ? user.userName : 'anon';
    if (existingLogger) {
      this.logger = existingLogger;
    } else {
      this.logger = this.JL(username);
      this.allLoggers.push(this.logger);
    }

    // set the log level based on environment
    const logLevel = environment.production ? this.JL.getInfoLevel() : this.JL.getAllLevel();

    // set up the AjaxAppender. This is what allows the logger to send items to the server.
    const existingAppender = this.allAppenders.filter(a => a.appenderName === username + 'Appender')[0];
    if (existingAppender) {
      this.appender = existingAppender;
    } else {
      this.appender = this.JL.createAjaxAppender(username + 'Appender');
      this.allAppenders.push(this.appender);
    }

    const authorizationValue = `Bearer ${user.accessToken}`;
    this.appender.setOptions({
      'level': logLevel, // items with this log level or higher get sent to the server
      'storeInBufferLevel': logLevel, // at this level, store log messages in the internal buffer
      'sendWithBufferLevel': this.JL.getErrorLevel(), // if log an error level or higher message, send everything in the buffer ASAP
      'bufferSize': 50, // hold up to 50 items in the buffer
      'batchSize': 50, // send items to the server in batches of 50.
      'batchTimeout': 300000, // if there are log messages that haven't been sent for 5 minutes, send them at the five minute mark even if less than batch size.
      'maxBatchSize': 200, // if server can't be reached, this is the max number of log messages to store
      'url': this.configService.config.apiUrl + '/Log', // this is the URL to use for sending log messages to the server
      'beforeSend': (xhr) => {
        xhr.setRequestHeader('Authorization', authorizationValue);
      }
    });

    // set the options for the logger
    this.logger = this.logger.setOptions({
      'level': logLevel, // log messages at this log level
      'appenders': [this.appender] // use the Ajax Appender created above for sending messages to server.
    });
  }

  // method to force sending of all messages in the batch buffer to the server now.
  sendLogMessagesToServerNow(): void {
    this.appender.sendBatch();
  }

  stringifyObject(objectToStringify: any) {
    if (objectToStringify) {
      const jsonForObj = JSON.stringify(objectToStringify);
      return '; ' + jsonForObj;
    }
    return '';
  }

  info(logMessage: string, objectToStringify?: any) {
    this.logger.info(logMessage + this.stringifyObject(objectToStringify));
  }

  warn(logMessage: string, objectToStringify?: any) {
    this.logger.warn(logMessage + this.stringifyObject(objectToStringify));
  }

  error(logMessage: string, objectToStringify?: any) {
    this.logger.error(logMessage + this.stringifyObject(objectToStringify));
  }

  fatal(logMessage: string, objectToStringify?: any) {
    this.logger.fatal(logMessage + this.stringifyObject(objectToStringify));
  }

  debug(logMessage: string, objectToStringify?: any) {
    this.logger.debug(logMessage + this.stringifyObject(objectToStringify));
  }

  trace(logMessage: string, objectToStringify?: any) {
    this.logger.trace(logMessage + this.stringifyObject(objectToStringify));
  }
}
