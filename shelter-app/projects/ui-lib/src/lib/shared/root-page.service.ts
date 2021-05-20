import { Injectable } from '@angular/core';
import {ArrayDataSource} from './cdk-data-source';
import {AccordionData, PeriodicElement} from '../controls';
import {SwaggerNative, SwaggerObject, swaggerUI} from './swagger-object';
import {RootPageService} from './services-api';

/*
 {
   key1,
   key2,
   [view-parent]: {
   },
   [view] : {
     key1:{}, key2:{}
     parent: view-parent
   }
 }
 */

@Injectable()
export class RootPageServiceImpl implements RootPageService {
  // accData: AccordionData[] = [{label: 'AAAAaaa', data: 'a data'}, {label: 'BBBBBbbbb', data: 'b data'}];
  private dbData = {
    'test-dynamic': {
      properties: {
        dataSource,
        ds1: dataSource.registerDS(),
        swagger: SWAGGER,
        // accData: this.accData
      },
      // html: '<table-element swagger="{{swagger}}" data-source="{{dataSource}}"></table-element>'
      // html: '<lib-card-element><lib-card-content>ASd asd</lib-card-content></lib-card-element>'
      // html: `<lib-tab-group-element ds="{{ds1}}" label="{{name}}">
      //           <lib-card-element><lib-card-content>
      //               <ui-span txt="{{ds1.position}}"></ui-span>
      //           </lib-card-content></lib-card-element>
      //        </lib-tab-group-element>`
      // html: `<lib-accordion-element ds="{{ds1}}" label="{{name}}">
      html: `<lib-carousel-element ds="{{ds1}}">
                <lib-card-element><lib-card-content>
                  <lib-card-element><lib-card-content>
                    <ui-span txt="{{ds1.position}}"></ui-span>
                  </lib-card-content></lib-card-element>
                  <ui-span txt="{{ds1.weight}}"></ui-span>
                  <ui-span txt="{{ds1.symbol}}"></ui-span>
                  <ui-span txt="{{ds1.colA}}"></ui-span>
                  <ui-span txt="{{ds1.colB}}"></ui-span>
                  <ui-span txt="{{ds1.colC}}"></ui-span>
                </lib-card-content></lib-card-element>
        </lib-carousel-element>`
      //         </lib-accordion-element>`
      // html: '<lib-accordion-element data="{{accData}}"></lib-accordion-element>'
    }
  };

  private data;
  constructor() {
  }
  static fromRoot(root: RootPageServiceImpl): RootPageService {
    const r = new RootPageServiceImpl();
    r.data = root.data;
    return r;
  }
  getPageData(key: string): string {
    this.data = this.dbData[key];
    return this.data.html;
  }
  savePageData(key): void {
    this.dbData[key] = this.data;
  }
  getData(key: string): any {
    return this.data.properties[key];
  }
  setData(key: string, value): void {
    this.data.properties[key] = value;
  }
  flushPageData(): void {
    this.data = null;
  }
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', colA: 'A1 some text', colB: 'B1 some text', colC: 'C1 some text', colD: 'D1 some text', colE: 'E1 some text'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', colA: 'A2 some text', colB: 'B2 some text', colC: 'C2 some text', colD: 'D2 some text', colE: 'E2 some text'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', colA: 'A3 some text', colB: 'B3 some text', colC: 'C3 some text', colD: 'D3 some text', colE: 'E3 some text'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', colA: 'A4 some text', colB: 'B4 some text', colC: 'C4 some text', colD: 'D4 some text', colE: 'E4 some text'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', colA: 'A5 some text', colB: 'B5 some text', colC: 'C5 some text', colD: 'D5 some text', colE: 'E5 some text'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', colA: 'A6 some text', colB: 'B6 some text', colC: 'C6 some text', colD: 'D6 some text', colE: 'E6 some text'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', colA: 'A7 some text', colB: 'B7 some text', colC: 'C7 some text', colD: 'D7 some text', colE: 'E7 some text'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', colA: 'A8 some text', colB: 'B8 some text', colC: 'C8 some text', colD: 'D8 some text', colE: 'E7 some text'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', colA: 'A9 some text', colB: 'B9 some text', colC: 'C9 some text', colD: 'D9 some text', colE: 'E9 some text'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', colA: 'A10 some text', colB: 'B10 some text', colC: 'C10 some text', colD: 'D10 some text', colE: 'E10 some text'},
];
const dataSource = new ArrayDataSource(ELEMENT_DATA);

const SWAGGER = new SwaggerObject(
  ['position', 'name', 'weight', 'symbol', 'colA', 'colB', 'colC', 'colD', 'colE'],
  {
    position: SwaggerNative.asInteger(),
    name: SwaggerNative.asString(),
    weight: SwaggerNative.asNumber(),
    symbol: SwaggerNative.asString(),
    colA: SwaggerNative.asString(),
    colB: SwaggerNative.asString(),
    colC: SwaggerNative.asString(),
    colD: SwaggerNative.asString(),
    colE: SwaggerNative.asString()
  },
  swaggerUI([{lang: 'en', title: 'Simple table'}, {lang: 'uk', title: 'Тестова табличка'}])
);
