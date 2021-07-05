import {InjectionToken} from '@angular/core';
import {I18NType, TitleType} from '../shared';

// tslint:disable:variable-name
export const EditorStoreToken = new InjectionToken<EditorStore>('EditorStoreService');
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
export interface EditorStore {
  templateList(): Array<{id: string, title: string | TitleType[]}>;
  getTemplate(id: string): Page;
  addTemplate(template: Page): void;
  removeTemplate(id: string): void;
  updateTemplate(template: Page): void;
  pageList(): Array<{id: string, title: string | TitleType[]}>;
  getPage(id: string): Page;
  addPage(page: Page): void;
  removePage(id: string, version?: number): void;
  updatePage(id: string): number;
}
