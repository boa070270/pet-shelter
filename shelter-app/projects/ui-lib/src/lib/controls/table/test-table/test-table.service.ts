import { Injectable } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestTableService {
  columns = ['position', 'name', 'weight', 'symbol', 'colA', 'colB', 'colC', 'colD', 'colE'];
  datasource = new ExampleDataSource();
  constructor() { }
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
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

export class ExampleDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<PeriodicElement[]>(ELEMENT_DATA);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect(): void {}
}
