import { Injectable } from '@angular/core';
import {HttpResponse} from "@angular/common/http";
import {FieldTypeUI, LanguageType, Response} from "../common";
import {map} from "rxjs/operators";
import {BasicService} from "../basic.service";
import {Observable} from "rxjs";
import {AbstractDataSource, DataExpectedResult, DataService, IFilter, IOrder, MainDataSource} from "ui-lib";
import {ListRange} from "@angular/cdk/collections";

export interface DsType {
  name: string;
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
    return this.basicService.deleteDs(row.name).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: DsType): Observable<DataExpectedResult<DsType>> {
    return this.basicService.addDs(row).pipe(
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
}
