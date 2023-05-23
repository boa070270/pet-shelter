import {EditorStore, Page, TitleType} from 'ui-lib';
import {Observable} from 'rxjs';
import {HTML1, HTML2} from './test-data';
import {ActivatedRoute, Router} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class EditorStoreMock implements EditorStore {
  constructor(router: Router, activateRoute: ActivatedRoute) {
    console.log('EditorStoreMock', router, activateRoute);
    activateRoute.url.subscribe(v => console.log('EditorStoreMock.url', v));
    activateRoute.params.subscribe(v => console.log('EditorStoreMock.params', v));
    activateRoute.queryParams.subscribe(v => console.log('EditorStoreMock.queryParams', v));
    activateRoute.fragment.subscribe(v => console.log('EditorStoreMock.fragment', v));
    activateRoute.data.subscribe(v => console.log('EditorStoreMock.data', v));
  }
  addPage(page: Page): void {
    console.log('callstack ' + new Error().stack);
  }
  //WHo and how would activate first and manage
  addTemplate(template: Page): void {
    console.log('callstack ' + new Error().stack);
  }

  getPage(id: string): Observable<Page> {
    console.log('callstack ' + new Error().stack);
    const p: Page = {
      id: 'root',
      swf: undefined,
      title: 'First Test',
      staticData: {},
      i18n: {},
      source: HTML2,
      dataSources: undefined,
      version: 1,
      privilege: undefined,
      published: undefined
    };
    const o = new Observable<Page>(s => s.next(p));
    return o;
  }

  getTemplate(id: string): Page {
    console.log('callstack ' + new Error().stack);
    return undefined;
  }

  pageList(): Array<{ id: string; title: string | TitleType[] }> {
    console.log('callstack ' + new Error().stack);
    return undefined;
  }

  removePage(id: string, version?: number): void {
    console.log('callstack ' + new Error().stack);
  }

  removeTemplate(id: string): void {
    console.log('callstack ' + new Error().stack);
  }

  templateList(): Array<{ id: string; title: string | TitleType[] }> {
    console.log('callstack ' + new Error().stack);
    return undefined;
  }

  updatePage(page: Page): number {
    console.log('callstack ' + new Error().stack);
    return 0;
  }

  updateTemplate(template: Page): void {
    console.log('callstack ' + new Error().stack);
  }

}
