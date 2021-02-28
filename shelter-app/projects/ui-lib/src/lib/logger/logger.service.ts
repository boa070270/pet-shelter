import {Inject, Injectable, Optional} from '@angular/core';
import {choiceFormat, LoggerConfigurationToken, LogLevel, UILogger} from '../shared';

@Injectable({
  providedIn: 'root'
})
export class LoggerService implements UILogger {

  constructor(@Optional() @Inject(LoggerConfigurationToken) private loggerConfig) { }

  debug(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Debug) {
      this.out(message, ...params);
    }
  }

  info(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Info) {
      this.out(message, ...params);
    }
  }

  warn(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Warn) {
      this.out(message, ...params);
    }
  }

  error(message: any, ...params): void {
    this.out(message, ...params);
  }
  private out(message: any, ...params): void {
    if (typeof message === 'string') {
      console.log(choiceFormat(message, ...params));
    } else {
      console.log(message);
    }
  }
}
