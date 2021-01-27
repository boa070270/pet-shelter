import {Injectable, isDevMode} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface LogEvent {
  level: string;
  message: any;
}
export const DEBUG_LEVEL = 'debug';
export const INFO_LEVEL = 'info';
export const WARNING_LEVEL = 'warn';
export const ERROR_LEVEL = 'error';
export const EMPTY_LOG_EVENT: LogEvent = {level: DEBUG_LEVEL, message: 'empty'};
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  emitter: BehaviorSubject<LogEvent> = new BehaviorSubject<LogEvent>(EMPTY_LOG_EVENT);
  constructor() { }
  debug(message: any): void {
    if (isDevMode()) {
      console.log(DEBUG_LEVEL, message);
      this.emitter.next({level: DEBUG_LEVEL, message});
    }
  }
  info(message: any): void {
    if (isDevMode()) {
      console.log(INFO_LEVEL, message);
    }
    this.emitter.next({level: INFO_LEVEL, message});
  }
  warn(message: any): void {
    if (isDevMode()) {
      console.log(WARNING_LEVEL, message);
    }
    this.emitter.next({level: WARNING_LEVEL, message});
  }
  error(message: any): void {
    if (isDevMode()) {
      console.log(ERROR_LEVEL, message);
    }
    this.emitter.next({level: ERROR_LEVEL, message});
  }
}
