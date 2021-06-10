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
  data?: DsDataType[];
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
    return this.insertData(row);
  }
  removeNull(obj): any {
    const replacer = (key, value) =>
      String(value) === 'null' ? undefined : value;
    return JSON.parse(JSON.stringify(obj, replacer));
  }
}

export interface DsDataType {
  ctid: string;
  [key: string]: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class DsDataService extends DataService<DsDataType>{
  ds: string;
  fields: DsFieldType[];

  constructor(private basicService: BasicService) {
    super();
  }
  // {ds: 'ds1, id: ctid, pkfield: val}
  deleteData(row: DsDataType): Observable<DataExpectedResult<DsDataType>> {
    const filter = this.dataFilter(row);
    this.fields.forEach(f => {
      if (f.pk) {
        filter.id = undefined;
        filter[f.field] = row[f.field];
      }
    });
    return this.basicService.deleteDsData({ds: this.ds, filter}).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: DsDataType): Observable<DataExpectedResult<DsDataType>> {
    return this.basicService.addDsData({ds: this.ds, data: this.removeNull(row)}).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, orders?: IOrder[]): Observable<DataExpectedResult<DsDataType>> {
    return this.basicService.getDsData(this.ds).pipe(map( r => {
      console.log(r);
      const data = r.body.data.data;
      return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
    }));
  }
  updateData(row: DsDataType): Observable<DataExpectedResult<DsDataType>> {
    const filter = this.dataFilter(row);
    return this.basicService.updateDsData({ds: {ds: this.ds, data: this.removeNull(row)}, filter}).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  dataFilter(row): any {
    const filter = {id: row.ctid};
    this.fields.forEach(f => {
      if (f.pk) {
        filter.id = undefined;
        filter[f.field] = row[f.field];
      }
    });
    return filter;
  }
  removeNull(obj): any {
    const replacer = (key, value) =>
      String(value) === 'null' ? undefined : value;
    return JSON.parse(JSON.stringify(obj, replacer));
  }
}
