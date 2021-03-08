import {Inject, Injectable, Optional} from '@angular/core';
import {
  choiceFormat,
  LoggerConfiguration,
  LoggerConfigurationToken,
  LogLevel,
  UILogger,
  UILoggerWriterToken,
  UILogWriter
} from '../shared';

@Injectable()
export class LoggerService implements UILogger {

  constructor(@Optional() @Inject(LoggerConfigurationToken) private loggerConfig: LoggerConfiguration,
              @Inject(UILoggerWriterToken) private writer: UILogWriter) { }

  debug(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Debug) {
      this.out(LogLevel.Debug, message, ...params);
    }
  }

  info(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Info) {
      this.out(LogLevel.Info, message, ...params);
    }
  }

  warn(message: any, ...params): void {
    if (this.loggerConfig.level <= LogLevel.Warn) {
      this.out(LogLevel.Warn, message, ...params);
    }
  }

  error(message: any, ...params): void {
    this.out(LogLevel.Error, message, ...params);
  }
  private out(level: LogLevel, message: any, ...params): void {
    if (typeof message === 'string') {
      this.writer.write(new Date(), level, choiceFormat(message, ...params));
    } else {
      this.writer.write(new Date(), level, message);
    }
  }
}
