import {ErrorHandler, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UIErrorHandler} from './ui-error-handler';
import {LoggerConfigurationToken, LogLevel, UILoggerToken, UILoggerWriterToken} from '../shared';
import {LoggerService} from './logger.service';
import {ConsoleLogWriter} from './console-log-writer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    {provide: ErrorHandler, useClass: UIErrorHandler},
    {provide: UILoggerToken, useClass: LoggerService},
    {provide: LoggerConfigurationToken, useValue: {level: LogLevel.Debug}},
    {provide: UILoggerWriterToken, useClass: ConsoleLogWriter}
  ]
})
export class LoggerModule { }
