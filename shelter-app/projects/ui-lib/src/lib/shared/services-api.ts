/**
 * Logger Injection token
 */
import {InjectionToken} from '@angular/core';
import {I18NType, ObtainSystemLanguage, SystemLang} from './language';
import {AbstractDataSource, DataService} from './cdk-data-source';
import {Observable} from "rxjs";

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

/**
 * SystemLang
 */
export const SYSTEM_LANG_TOKEN = new InjectionToken<SystemLang>('SystemLang');
export const EXT_SYSTEM_LANG = new InjectionToken<ObtainSystemLanguage>('ObtainSystemLanguage');
export const I18N_CFG = new InjectionToken<I18NType>('Allow i18n components');
/**
 * Local storage
 */
export const LOCAL_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});
/**
 * Storage service
 */
export interface StorageService {
  get(key: string): string;
  set(key: string, value: string): void;
  getObj(key: string): any;
  setObj(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}
export const STORAGE_SERVICE = new InjectionToken<StorageService>('Storage Service');
export const BROWSER_STORAGE = new InjectionToken<StorageService>('Browser Local Storage Service');
/**
 * RootPage service. Allow translate data to dynamic page
 */
export interface HierarchyPageService {
  getPageData(key: string): string;
  savePageData(key): void;
  getData(key: string): any;
  setData(key: string, value): void;
  flushPageData(): void;
}
export const ROOT_PAGE_DATA = new InjectionToken<HierarchyPageService>('HierarchyPageService');
/**
 * DataSource service
 */
export const CUSTOM_DS_SERVICE = new InjectionToken<CustomDSService>('Providing Custom DataSource');
export interface DsType {
  ds: string;
  description?: object;
  fields?: DsFieldType[];
}
export interface DsFieldType {
  ds: string;
  field: string;
  pk: boolean;
  type: DsFldTypeEnum;
}

export enum DsFldTypeEnum {
  string = 'string',
  number = 'number',
  date = 'date'
}
export function removeNull(obj): any {
  const replacer = (key, value) =>
    String(value) === 'null' ? undefined : value;
  const str = JSON.stringify(obj, replacer);
  if (!str) {
    return undefined;
  }
  return JSON.parse(str);
}
export interface DsDataType {
  [key: string]: string | number;
}
export interface CustomDSService {
  knownDS(): Array<DsType>;
  obtainDS<T extends AbstractDataSource<any>>(name: string): T;
}

/**
 * EngineModel
 */
export interface EngineModelService {
  loadModel(id: string): Observable<any>;
  storeModel(id: string, model: any): Observable<any>;
  deleteModel(id: string): Observable<any>;
}
/**
 * DynamicPage
 */
