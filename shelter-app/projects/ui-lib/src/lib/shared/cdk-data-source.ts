import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {BehaviorSubject, ConnectableObservable, merge, Observable, of, Subject, Subscription, zip} from 'rxjs';
import {map, publishLast, reduce, takeLast, tap} from 'rxjs/operators';
import {equals as eqLstRange, sortOut} from './paging';

export interface IOrder {
  p: string;
  order: number;
}

/**
 * IFilter interface that allow manage filtering
 * internal is used by filtering local data (that has been downloaded)
 * external is used to give parameters to the external query
 */
export interface IFilter {
  internal?: {[key: string]: string};
  external?: {[key: string]: string};
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
export abstract class DataService<T> {
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
  protected readonly consumers: Array<CdkDataSource<T, any>> = [];
  protected data: T[];
  protected lastModified: Date;
  protected equalData: (o1: any, o2: any) => boolean;
  total = new BehaviorSubject(0);
  filtered = new BehaviorSubject(0);

  protected constructor(protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
                        protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
                        protected compareData?: (d1: T, d2: T) => number) {
    this.data = [];
    this.lastModified = new Date(0);
    this.equalData = this.compareData ? (p1, p2) => this.compareData(p1, p2) === 0 : simpleEquals;
  }

  registerDS<U>(): CdkDataSource<T, U> {
    const c = new CdkDataSource<T, U>(this);
    this.consumers.push(c);
    return c;
  }

  unregisterDS<U>(ds: CdkDataSource<T, U>): void {
    const ixn = this.consumers.indexOf(ds);
    if (ixn) {
      this.consumers.splice(ixn, 1);
    }
  }

  obtainPage<U>(ds: CdkDataSource<T, U>, force?: boolean): void {
    if (force || this.lastModified.getTime() < Date.now() - 5000) {
      if (force) {
        this.data = [];
      }
      const observable = this.loadData(ds, force);
      observable.subscribe(() => this.updateSubject(ds));
    } else {
      this.updateSubject(ds);
    }
  }

  protected abstract loadData(ds: CdkDataSource<T, any>, force?: boolean): Observable<any>;

  protected updateSubject(ds: CdkDataSource<T, any>): void {
    const {lstRange, queryParams, orderParams} = ds;
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
      if (typeof queryParams === 'string') {
        filter = (a) => Object.values(a).find(v => ('' + v).includes(queryParams)) !== undefined;
      } else if (typeof queryParams === 'object' && queryParams && queryParams.internal) {
        filter = (a) => {
          for (const [key, value] of Object.entries(queryParams.internal)) {
            if (('' + a[key]).includes('' + value)) {
              return true;
            }
          }
        };
      }
    }
    const d = this.data.filter(filter).sort(compare).slice(lstRange.start, lstRange.end);
    this.filtered.next(this.data.filter(filter).length);
    ds.subject.next(ds.trIn(d));
  }

  deleteRow<U>(ds: CdkDataSource<T, U>, row: U): Observable<DataExpectedResult<U>> {
    const r = ds.trOut([row]);
    const i = this.data.indexOf(r[0]);
    if (i >= 0) {
      console.log('deletedRow', r[i]);
      this.data.splice(i, 1);
    }
    return this.delete(r[0]).pipe(
      tap(() => this.updateConsumers(ds)),
      map( d => {
        return {totalAll: d.totalAll, totalFiltered: d.totalFiltered, responseTime: d.responseTime, data: ds.trIn(d.data)};
      })
    );
  }
  insertRow<U>(ds: CdkDataSource<T, U>, row: U): Observable<DataExpectedResult<U>> {
    const r = ds.trOut([row]);
    this.data.push(r[0]);
    return this.insert(r[0]).pipe(
      tap(() => this.updateConsumers(ds)),
      map( d => {
        return {totalAll: d.totalAll, totalFiltered: d.totalFiltered, responseTime: d.responseTime, data: ds.trIn(d.data)};
      })
    );
  }
  updateRow<U>(ds: CdkDataSource<T, U>, row: U, oldRow: U): Observable<DataExpectedResult<U>> {
    const r = ds.trOut([row]);
    const rOld = ds.trOut([oldRow]);
    const i = this.data.indexOf(rOld[0]);
    this.data[i] = r[0];
    return this.update(r[0]).pipe(
      tap(() => this.updateConsumers(ds)),
      map( d => {
        return {totalAll: d.totalAll, totalFiltered: d.totalFiltered, responseTime: d.responseTime, data: ds.trIn(d.data)};
      })
    );
  }
  abstract delete(row: T): Observable<DataExpectedResult<T>>;
  abstract insert(row: T): Observable<DataExpectedResult<T>>;
  abstract update(row: T): Observable<DataExpectedResult<T>>;
  protected updateConsumers(who: CdkDataSource<T, any>): void {
    this.consumers.forEach((c) => {
      if (c !== who) {
        this.updateSubject(c);
      }
    });
  }

  destroy(): void {
  }

  abstract setData(data: any[]): void;
}
export class ArrayDataSource<T> extends AbstractDataSource<T> {
  constructor(data: any[],
              protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
              protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
              protected compareData?: (d1: any, d2: any) => number) {
    super(equalsOrder, equalsFilter, compareData);
    this.data = data || [];
    this.total.next(this.data.length);
  }
  static EmptyDS(): ArrayDataSource<any> {
    return new ArrayDataSource([]);
  }
  protected loadData(ds: CdkDataSource<T, any>, force?: boolean): Observable<any> {
    return of(true);
  }
  setData(data: any[]): void {
    this.data = data;
    this.total.next(data.length);
    this.updateConsumers(null);
  }
  delete(row: T): Observable<DataExpectedResult<T>> {
    return of({totalAll: this.total.getValue(), totalFiltered: this.total.getValue(), data: [], responseTime: this.lastModified});
  }
  insert(row: T): Observable<DataExpectedResult<T>> {
    return of({totalAll: this.total.getValue(), totalFiltered: this.total.getValue(), data: [], responseTime: this.lastModified});
  }
  update(row: T): Observable<DataExpectedResult<T>> {
    return of({totalAll: this.total.getValue(), totalFiltered: this.total.getValue(), data: [], responseTime: this.lastModified});
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
  private readonly workers: LoaderWorker<T>[] = [];
  // private subscription: Subscription; TODO need to unsubscribe all waste
  private externalModified: boolean;

  constructor(private dataService: DataService<T>,
              protected minSize,
              protected maxSize,
              protected equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
              protected equalsFilter: (f1: any, f2: any) => boolean = simpleEquals,
              protected compareData?: (d1: T, d2: T) => number) {
    super(equalsOrder, equalsFilter, compareData);
    // this.makeWorker({start: 0, end: 20});
  }

  private makeWorker(lstRange: ListRange, query?: any, order?: any): LoaderWorker<T> {
    const worker = {
      lstRange, query, order, subscriptions: 1,
      work: this.dataService.obtainData(lstRange, query, order).pipe(
        takeLast(1),
        tap(d => {
          this.concatDate(d);
        }),
        publishLast()
      )
    };
    this.workers.push(worker);
    if (typeof (worker.work as any).connect === 'function') {
      (worker.work as ConnectableObservable<DataExpectedResult<T>>).connect();
    }
    return worker;
  }
  private cleanWorkers(): void {
    const toClean = this.workers.filter(w => w.subscriptions === 0);
    for (const worker of toClean) {
      const ixn = this.workers.findIndex(w => w === worker);
      if (ixn >= 0) {
        this.workers.splice(ixn, 1);
        console.log('MainDataSource.cleanWorker 1');
      }
    }
  }

  setData(data: any[]): void {}

  protected loadData(ds: CdkDataSource<T, any>, force?: boolean): Observable<any> {
    const {lstRange, queryParams, orderParams} = ds;
    if (force) {
      const worker = this.makeWorker(lstRange, queryParams, orderParams);
      return new Observable(subscriber => {
        worker.work.subscribe(() => {
          subscriber.next(true);
          subscriber.complete();
        },
          error => {
            console.log(error);
          },
          () => {
            worker.subscriptions--;
            this.cleanWorkers();
          });
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
      const {present, absent} = sortOut(lstRange, available);
      const workers = this.workers.filter(w => present.find(p => eqLstRange(w.lstRange, p)));
      workers.forEach(w => w.subscriptions++); // say that we uses these workers
      for (const r of absent) {
        workers.push(this.makeWorker(r, queryParams, orderParams));
      }
      const src = workers.map(w => w.work);
      if (usesData && lstRange.start < this.data.length) {
        const data = this.data.slice(lstRange.start, lstRange.end < this.data.length ? lstRange.end : this.data.length);
        src.unshift(of({data, responseTime: this.lastModified, totalAll: this.total.getValue(), totalFiltered: 0, scrollId: undefined}));
      }
      const worker = zip(...src);
      return new Observable(subscriber => {
        worker.subscribe(() => {
          subscriber.next(true);
          subscriber.complete();
        },
          error => {
            console.log(error);
          },
          () => {
            workers.forEach(w => w.subscriptions--);
            this.cleanWorkers();
          });
      });

    }
  }
  private updateCounters(r: DataExpectedResult<T>): void {
    if (r.responseTime.getTime() > this.lastModified.getTime()) {
      this.lastModified = r.responseTime;
      this.total.next(r.totalAll);
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
  delete(row: T): Observable<DataExpectedResult<T>> {
    return this.dataService.deleteData(row);
  }
  insert(row: T): Observable<DataExpectedResult<T>> {
    return this.dataService.insertData(row);
  }
  update(row: T): Observable<DataExpectedResult<T>> {
    return this.dataService.updateData(row);
  }
}

export class CdkDataSource<U, T> extends DataSource<T> {
  lstRange: ListRange = {start: 0, end: 0};
  queryParams: any;
  orderParams: IOrder[];
  selectedRows = [];
  subject = new Subject<T[]>();
  private subscription: Subscription;
  // Transform data from AbstractDataSource to CdkDataSource
  trIn: (v: U[]) => T[] = (v) => v as unknown as T[];
  // Transform data from CdkDataSource to AbstractDataSource
  trOut: (v: T[]) => U[] = (v) => v as unknown as U[];
  get totalRecords(): BehaviorSubject<number> {
    return this.main.total;
  }
  get filteredRecords(): BehaviorSubject<number> {
    return this.main.filtered;
  }
  constructor(private main: AbstractDataSource<U>) {
    super();
  }
  connect(collectionViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>> {
    this.subscription = collectionViewer.viewChange.subscribe(r => {
      this.lstRange = r;
      this.main.obtainPage(this);
    });
    return this.subject;
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
  updateRow(row: T, oldRow: T): Observable<DataExpectedResult<T>> {
    return this.main.updateRow(this, row, oldRow).pipe(
      tap(() => this.main.obtainPage(this))
    );
  }
  insertRow(row: T): Observable<DataExpectedResult<T>> {
    return this.main.insertRow(this, row).pipe(
      tap(() => this.main.obtainPage(this))
    );
  }
  deleteRow(row: T): Observable<DataExpectedResult<T>> {
    return this.main.deleteRow(this, row).pipe(
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
