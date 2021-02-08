import {Observable} from 'rxjs';
import {Type} from '@angular/core';

export interface TableSchema {
  caption?: string;
  columns?: string[];
  observableData?: Observable<ReadonlyArray<any>>;
  fnEqual?: (a: any, b: any) => boolean;
  columnTypes?: {[cell: string]: (row: any, cell: string) => string | Type<any>};
  filtered?: boolean;
  stickied?: boolean;
  rowNumbers?: boolean;
}
