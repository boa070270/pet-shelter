import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {BehaviorSubject, ConnectableObservable, EMPTY, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {mapTo, publishLast, reduce, takeLast, tap} from 'rxjs/operators';
import {changePage, equals as eqLstRange, newPageSize, sortOut} from './list-range-helper';

export const PagingSize = [10, 20, 50, 100];
export interface IOrder {
  p: string;
  order: number;
}
export interface IFilter {
  // priority top, if true return only select rows
  selected: boolean;
  // priority 1 if not empty filter all property on this string
  light: string;
  // if light empty, check every property
  property: {[key: string]: string};
}
export function simpleCompare(p1: any, p2: any): number {
  if (p1 === p2 || typeof p1 !== typeof p2 || typeof p1 === 'function' || typeof p2 === 'function') {
    return 0; // when we cannot compare return 0, we can use it for filter but not as base for equal
  }
  if (p1 === undefined) {
    return -1;
  } else if (p2 === undefined) {
    return 1;
  }
  switch (typeof p1) {
    case 'string':
      return (p1 as string).localeCompare(p2);
    case 'number':
    case 'bigint':
      return (p1 as number) - (p2 as number);
    case 'boolean': // recognize false < true
      return p1 ? -1 : 1;
    case 'object':
  }
}
export interface DataExpectedResult<T> {
  data: T[];
  /*
  The number of rows in the source
   */
  totalAll: number;
  /*
  The number of rows for this filter, if filter doesn't applied this equal to totalAll
  TODO this waits on implementation
   */
  totalFiltered: number;
  /*
  This time is used to cache data
   */
  responseTime: Date;
  scrollId?: string;
}
export declare abstract class DataService<T> {
  abstract obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<T>>;
  abstract deleteData(row: T): Observable<DataExpectedResult<T>>;
  abstract updateData(row: T): Observable<DataExpectedResult<T>>;
  abstract insertData(row: T): Observable<DataExpectedResult<T>>;
}

interface LoaderWorker<T> {
  lstRange: ListRange;
  query?: any;
  order?: any;
  work: Observable<DataExpectedResult<T>>;
  subscriptions: number;
}
function simpleEquals(o1: any, o2: any): boolean {
  if (o1 === o2) {
    return true;
  }
  if ((o1 === undefined || o1 === null) && (o2 === undefined || o2 === null)) {
    return true;
  }
  if (typeof o1 === 'object' && typeof o2 === 'object') {
    const e1 = Object.entries(o1);
    const e2 = Object.entries(o2);
    if (e1.length === e2.length
      && e1.find( e => !simpleEquals(e[1], o2[e[0]])) === undefined
      && e2.find( e => !simpleEquals(e[1], o1[e[0]])) === undefined
    ) {
      return true;
    }
  }
  return false;
}
export abstract class AbstractDataSource<T> {
  protected readonly consumers: Map<CdkDataSource<T>, Subject<T[]>> = new Map<CdkDataSource<T>, Subject<T[]>>();
  protected data: T[];
  protected lastModified: Date;
  protected total: number;
  protected equalData: (o1: any, o2: any) => boolean;
  get totalRecords(): number {
    return this.total || 0;
  }
  protected constructor(protected minSize: number = 20,
                        protected maxSize: number = 200,
                        protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
                        protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
                        protected compareData?: (d1: T, d2: T) => number) {
    this.data = [];
    this.equalData = this.compareData ? (p1, p2) => this.compareData(p1, p2) === 0 : simpleEquals;
  }
  registerDS(): CdkDataSource<T> {
    const ds = new CdkDataSource<T>(this);
    // TODO I don't like that we stored data in this.dada, then part of it in BehaviorSubject and then part in Table
    this.consumers.set(ds, new BehaviorSubject([]));
    return ds;
  }
  unregisterDS(ds: CdkDataSource<T>): void {
    const subj = this.consumers.get(ds);
    if (subj && !subj.isStopped) {
      subj.complete();
    }
    this.consumers.delete(ds);
  }
  getConsumer(ds: CdkDataSource<T>): Subject<T[]> {
    return this.consumers.get(ds);
  }
  obtainPage(ds: CdkDataSource<T>, force?: boolean): void {
    const subject = this.consumers.get(ds);
    this.updateSubject(subject, ds.lstRange, ds.queryParams, ds.orderParams, force);
  }
  protected abstract updateSubject(subject: Subject<T[]>, lst: ListRange, queryParams: any, orderParams: IOrder[], force?: boolean): void;

  deleteRow(row: any): Observable<DataExpectedResult<T>> {
    console.log('deleteRow', row);
    const i = this.data.indexOf(row);
    if (i >= 0) {
      this.data.splice(i, 1);
    }
    return of({totalAll: this.total, totalFiltered: this.total, data: [], responseTime: this.lastModified});
  }

  insertRow(row: any): Observable<DataExpectedResult<T>> {
    console.log('insertRow', row);
    this.data.push(row);
    return of({totalAll: this.total, totalFiltered: this.total, data: [], responseTime: this.lastModified});
  }

  updateRow(row: any): Observable<DataExpectedResult<T>> {
    console.log('updateRow', row);
    const i = this.data.indexOf(row);
    this.data[i] = row;
    return of({totalAll: this.total, totalFiltered: this.total, data: [], responseTime: this.lastModified});
  }
}
export class ArrayDataSource extends AbstractDataSource<any> {
  constructor(data: any[],
              protected minSize: number = 20,
              protected maxSize: number = 200,
              protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
              protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
              protected compareData?: (d1: any, d2: any) => number) {
    super(minSize, maxSize, equalsOrder, equalsFilter, compareData);
    this.data = data || [];
    this.total = this.data.length;
  }
  protected updateSubject(subject: Subject<any[]>, lst: ListRange, queryParams: any, orderParams: IOrder[],
                          force: boolean | undefined): void {
    let compare: (p1: any, p2: any) => number = () => 1;
    let filter: (p: any) => boolean = () => true;
    const compareData = this.compareData ? this.compareData : simpleCompare;
    if (orderParams && orderParams.length > 0) {
      compare = (a, b) => {
        let res;
        for (const o of orderParams) {
          res = compareData(a[o.p], b[o.p]);
          if (res !== 0) {
            return res * o.order;
          }
        }
        return res;
      };
    }
    if (queryParams) {
      filter = (a) => {
        if (typeof queryParams === 'string') {
          return Object.values(a).find(v => ('' + v).includes(queryParams)) !== undefined;
        } else {
          for (const [key, value] of Object.entries(queryParams)) {
            if (('' + a[key]).includes('' + value)) {
              return true;
            }
          }
        }
      };
    }
    const d = this.data.filter(filter).sort(compare).slice(lst.start, lst.end);
    subject.next(d);
  }
}
/**
 * Cases:
 * - we have all records of the data: we don't need to ask service to load, we sort and filter the data locally
 * - the data is so big that we can cache only part of it:
 *    - every different filter or sort will has a different result
 *    - queries that do not have filter nor sort can obtain a result from cache
 */
export class MainDataSource<T> extends AbstractDataSource<T>{
  private readonly workers: LoaderWorker<T>[];
  // private subscription: Subscription; TODO need to unsubscribe all waste
  private externalModified: boolean;

  constructor(private dataService: DataService<T>,
              protected minSize,
              protected maxSize,
              protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
              protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
              protected compareData?: (d1: T, d2: T) => number) {
    super(minSize, maxSize, equalsOrder, equalsFilter, compareData);
    this.makeWorker({start: 0, end: 20});
  }

  private makeWorker(lstRange: ListRange, query?: any, order?: any): LoaderWorker<T> {
    const worker = {
      lstRange, query, order, subscriptions: 1,
      work: this.dataService.obtainData(lstRange, query, order).pipe(
        takeLast(1),
        tap(d => {
          this.concatDate(d);
        }),
        mapTo(true),
        publishLast()
      )
    };
    this.workers.push(worker);
    (worker.work as ConnectableObservable<DataExpectedResult<T>>).connect();
    return worker;
  }
  private cleanWorkers(): void {
    const toClean = this.workers.filter(w => w.subscriptions === 0);
    for (const worker of toClean) {
      const ixn = this.workers.findIndex(w => w === worker);
      if (ixn >= 0) {
        this.workers.splice(ixn, 1);
      }
    }
  }
  protected updateSubject(subject: Subject<T[]>, lst: ListRange, queryParams: any, orderParams: IOrder[], force?: boolean): void {
    if (force) {
      const worker = this.makeWorker(lst, queryParams, orderParams);
      worker.work.subscribe((d) => {
        subject.next(d.data);
        worker.subscriptions--;
        this.cleanWorkers();
      });
    } else {
      let usesData = false;
      const available = this.workers // take all workers that has the same query and order
        .filter(v => this.equalsOrder(v.order, orderParams) && this.equalsFilter(v.query, queryParams))
        .map(v => v.lstRange);
      if (!queryParams && !orderParams && this.data.length > 0) {
        available.push({start: 0, end: this.data.length});
        usesData = true;
      }
      const {present, absent} = sortOut(lst, available);
      const workers = this.workers.filter(w => present.find(p => eqLstRange(w.lstRange, p)));
      workers.forEach(w => w.subscriptions++); // say that we uses these workers
      for (const r of absent) {
        workers.push(this.makeWorker(r, queryParams, orderParams));
      }
      const src = workers.map(w => w.work);
      if (usesData && lst.start < this.data.length) {
        const data = this.data.slice(lst.start, lst.end < this.data.length ? lst.end : this.data.length);
        src.unshift(of({data, responseTime: this.lastModified, totalAll: this.total, totalFiltered: 0, scrollId: undefined}));
      }
      const worker = merge(...src, 1)
        .pipe(
          reduce(
            (ac, cur) => {
              ac.data = ac.data.concat(cur.data);
              if ( ac.lastModified.getTime() < cur.responseTime.getTime() ) {
                ac.total = cur.totalAll;
                ac.lastModified = cur.responseTime;
              }
              return ac;
            },
            {data: [], total: 0, lastModified: new Date(0), scrollId: ''}),
          );
      worker.subscribe(d => {
        subject.next(d.data);
      });
      workers.forEach(w => w.subscriptions--);
      this.cleanWorkers();
    }
  }
  private updateCounters(r: DataExpectedResult<T>): void {
    if (r.responseTime.getTime() > this.lastModified.getTime()) {
      this.lastModified = r.responseTime;
      this.total = r.totalAll;
      this.externalModified = true;
    }
    // TODO d.scrollId isn't used
  }
  private concatDate(d: DataExpectedResult<T>): void {
    this.updateCounters(d);
    // TODO we need add new data to this cache without duplicate. This method need refactoring to increase performance
    d.data.forEach( e => {
      if (this.data.find(p => this.equalData(p, e)) === undefined) {
        this.data.push(e);
      }
    });
  }
  private _update(d: T[]): void {
  }
  deleteRow(row: any): Observable<DataExpectedResult<T>> {
    super.deleteRow(row);
    return this.dataService.deleteData(row)
      .pipe(
        tap( r => this.updateCounters(r))
      );
  }
  insertRow(row: any): Observable<DataExpectedResult<T>> {
    super.insertRow(row);
    return this.dataService.insertData(row)
      .pipe(
        tap( r => this.updateCounters(r))
      );
  }

  updateRow(row: any): Observable<DataExpectedResult<T>> {
    super.updateRow(row);
    return this.dataService.updateData(row)
      .pipe(
        tap( r => this.updateCounters(r))
      );
  }
}
export class CdkDataSource<T> extends DataSource<T> {
  private pSize: number = PagingSize[0];
  lstRange: ListRange = {start: 0, end: this.pSize};
  set pageSize(p: number) {
    this.pSize = p * 1;
    this.reCalcListRange();
  }
  get pageSize(): number {
    return this.pSize;
  }
  private curPage = 0;
  set currentPage(n: number) {
    const pos = n * 1 || 1;
    if (pos < 1) {
      this.curPage = 0;
    } else if (pos > this.maxPage) {
      this.curPage = this.pageSize - 1;
    } else {
      this.curPage = pos - 1;
    }
    this.lstRange = changePage(this.pSize, this.curPage);
    this.main.obtainPage(this);
  }
  get currentPage(): number {
    return this.curPage + 1;
  }
  get maxPage(): number {
    return Math.ceil(this.totalRecords / this.pSize);
  }
  queryParams: any;
  orderParams: IOrder[];
  selectedRows = [];
  get totalRecords(): number {
    return this.main.totalRecords;
  }
  private subscription: Subscription;
  constructor(private main: AbstractDataSource<T>) {
    super();
  }
  connect(collectionViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>> {
    this.subscription = collectionViewer.viewChange.subscribe(r => {
      this.lstRange = newPageSize(r, this.pSize);
      this.curPage = Math.floor(this.lstRange.start / this.pSize);
      this.main.obtainPage(this);
    });
    return this.main.getConsumer(this);
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.main.unregisterDS(this);
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
  sort(order: IOrder[]): void {
    this.orderParams = order;
    this.main.obtainPage(this);
  }
  filter(query: any): void {
    this.queryParams = query;
    this.main.obtainPage(this);
  }
  refresh(): void {
    this.main.obtainPage(this, true);
  }
  private reCalcListRange(): void {
    this.lstRange = newPageSize(this.lstRange, this.pSize);
    this.curPage = Math.floor(this.lstRange.start / this.pSize);
    this.main.obtainPage(this);
  }
  updateRow(row: T): Observable<DataExpectedResult<T>> {
    return this.main.updateRow(row).pipe(
      tap(() => this.main.obtainPage(this))
    );
  }
  insertRow(row: T): Observable<DataExpectedResult<T>> {
    return this.main.insertRow(row).pipe(
      tap(() => this.main.obtainPage(this))
    );
  }
  deleteRow(row: T): Observable<DataExpectedResult<T>> {
    return this.main.deleteRow(row).pipe(
      tap(() => {
        this.main.obtainPage(this);
        this.selectedRows = [];
      })
    );
  }
  clearSelectedRows(): void {
    this.selectedRows = [];
  }

}
