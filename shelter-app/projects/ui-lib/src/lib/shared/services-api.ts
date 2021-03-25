/**
 * Logger Injection token
 */
import {InjectionToken} from '@angular/core';

/**** Logger ****/
// tslint:disable-next-line:variable-name
export const UILoggerToken =
  new InjectionToken<UILogger>('LoggerService');
// tslint:disable-next-line:variable-name
export const UILoggerWriterToken =
  new InjectionToken<UILogger>('UILoggerWriterToken');
// tslint:disable-next-line:variable-name
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
/**
 * Component data service
 * The aim of this service is a providing data to a component
 */
// tslint:disable-next-line:variable-name
export const ComponentDataToken =
  new InjectionToken<ComponentData>('ComponentDataToken');
export interface ComponentData {
  get(key: string): any;
}
