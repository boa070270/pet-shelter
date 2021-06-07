import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators';
import {BasicService} from '../basic.service';
import {Observable} from 'rxjs';
import {DataExpectedResult, DataService, IFilter, IOrder} from 'ui-lib';
import {ListRange} from '@angular/cdk/collections';

export interface DsType {
  ds: string;
  description?: object;
  fields?: DsFieldType[];
  data?: object;
}
export interface DsFieldType {
  ds: string;
  field: string;
  type: DsFldTypeEnum;
}

export enum DsFldTypeEnum {
  string,
  number,
  date
}

@Injectable({
  providedIn: 'root'
})
export class DsService extends DataService<DsType>{

  constructor(private basicService: BasicService) {
    super();
  }

  deleteData(row: DsType): Observable<DataExpectedResult<DsType>> {
    return this.basicService.deleteDs(row.ds).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: DsType): Observable<DataExpectedResult<DsType>> {
    return this.basicService.addDs(this.removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, orders?: IOrder[]): Observable<DataExpectedResult<DsType>> {
    return this.basicService.getAllDsFields().pipe(map( r => {
      console.log(r);
      const data = r.body.data;
      return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
    }));
  }
  updateData(row: DsType): Observable<DataExpectedResult<DsType>> {
    return undefined;
  }
  removeNull(obj): any {
    const replacer = (key, value) =>
      String(value) === 'null' ? undefined : value;
    return JSON.parse(JSON.stringify(obj, replacer));
  }
}
