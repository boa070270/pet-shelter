import {ErrorHandler, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UIErrorHandler} from './ui-error-handler';
import {LoggerConfigurationToken, LogLevel, UILoggerToken} from '../shared';
import {LoggerService} from './logger.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    {provide: ErrorHandler, useClass: UIErrorHandler},
    {provide: UILoggerToken, useClass: LoggerService},
    {provide: LoggerConfigurationToken, useValue: {level: LogLevel.Debug}}
  ]
})
export class LoggerModule { }
