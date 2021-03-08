/**
 * Logger Injection token
 */
import {InjectionToken} from '@angular/core';

/**** Logger ****/
export const UILoggerToken =
  new InjectionToken<UILogger>('LoggerService');
export const UILoggerWriterToken =
  new InjectionToken<UILogger>('UILoggerWriterToken');
export const LoggerConfigurationToken =
  new InjectionToken<LoggerConfiguration>('LoggerConfiguration');

export interface UILogger {
  info(message: any, ...params): void;
  debug(message: any, ...params): void;
  warn(message: any, ...params): void;
  error(message: any, ...params): void;
}
export enum LogLevel {
  Debug, Info, Warn, Error
}
export interface LoggerConfiguration {
  level: LogLevel;
}
export interface UILogWriter {
  write(date: Date, level: LogLevel, message: string): void;
}
