import {Injectable, InjectionToken} from '@angular/core';
import {AbstractDataSource, I18NType, SwaggerSchema, TitleType} from '../shared';
import {Observable} from 'rxjs';

// tslint:disable:variable-name
export const EditorStoreToken = new InjectionToken<EditorStore>('EditorStoreService');
export const PageSnapshotToken = new InjectionToken<PageSnapshot>('EditorStoreService');
export const DEF_TEMPLATE = '<section><h1>Place title here</h1><p>Place main text here</p></section>';
export interface Page {
  id?: string;
  version?: number;
  title: string | TitleType[];
  source: string;
  dataSources?: string[];
  swf?: string[]; // SwaggerForms
  i18n?: {[key: string]: I18NType};
  staticData?: {[key: string]: any};
  privilege?: string[];
  published?: boolean;
}
export interface PageSnapshot {
  dataSources?: { [key: string]: AbstractDataSource<any> };
  swf?: {[key: string]: SwaggerSchema}; // SwaggerForms
  i18n?: {[key: string]: I18NType};
  staticData?: {[key: string]: any};
}
@Injectable()
export class PageSnapshotStorage {
  private _data: {[id: string]: PageSnapshot} = {};
  put(pageId: string, data: PageSnapshot): void {
    this._data[pageId] = data;
  }
  get(pageId: string): PageSnapshot {
    return this._data[pageId];
  }
  rm(pageId: string): void {
    delete this._data[pageId];
  }
}
export interface EditorStore {
  templateList(): Array<{id: string, title: string | TitleType[]}>;
  getTemplate(id: string): Page;
  addTemplate(template: Page): void;
  removeTemplate(id: string): void;
  updateTemplate(template: Page): void;
  pageList(): Array<{id: string, title: string | TitleType[]}>;
  getPage(id: string): Observable<Page>;
  addPage(page: Page): void;
  removePage(id: string, version?: number): void;
  updatePage(page: Page): number;
}
