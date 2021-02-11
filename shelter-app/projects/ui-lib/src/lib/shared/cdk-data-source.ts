import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {ConnectableObservable, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {mapTo, publishLast, reduce, takeLast, tap} from 'rxjs/operators';
import {equals as eqLstRange, sortOut} from './list-range-helper';

const MAX_CACHE_SIZE = 100;
const DEF_PORTION_SIZE = 20;


export interface DataExpectedResult<T> {
  data: T[];
  total: number;
  lastModified: Date;
  scrollId: string;
}
export declare abstract class DataService<T> {
  abstract obtainData(lstRange?: ListRange, query?: any, order?: any): Observable<DataExpectedResult<T>>;
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

/**
 * Cases:
 * - we have all records of the data: we don't need to ask service to load, we sort and filter the data locally
 * - the data is so big that we can cache only part of it:
 *    - every different filter or sort will has a different result
 *    - queries that do not have filter nor sort can obtain a result from cache
 */
export class MainDataSource<T> {
  readonly consumers: Map<CdkDataSource<T>, Subject<T[]>> = new Map<CdkDataSource<T>, Subject<T[]>>();
  private readonly workers: LoaderWorker<T>[];
  private readonly data: T[] = [];
  private lastModified: Date;
  private total: number;
  // private subscription: Subscription; TODO need to unsubscribe all waste
  private externalModified: boolean;

  constructor(private dataService: DataService<T>,
              private size: number = MAX_CACHE_SIZE,
              private equalsData: (d1: T, d2: T) => boolean = simpleEquals,
              private equalsOrder: (o1: any, o2: any) => boolean = simpleEquals,
              private equalsFilter: (f1: any, f2: any) => boolean = simpleEquals) {
    this.makeWorker({start: 0, end: 20});
  }

  registerDS(): CdkDataSource<T> {
    const ds = new CdkDataSource<T>(this);
    this.consumers.set(ds, new Subject());
    return ds;
  }
  unregisterDS(ds: CdkDataSource<T>): void {
    this.consumers.delete(ds);
  }
  obtainPage(ds: CdkDataSource<T>, force?: boolean): void {
    const lstRange = ds.lstRange;
    const queryParams = ds.queryParams;
    const orderParams = ds.orderParams;
    const subject = this.consumers.get(ds);
    this.updateSubject(subject, lstRange, queryParams, orderParams, force);
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
  private updateSubject(subject: Subject<T[]>, lst: ListRange, queryParams: any, orderParams: any, force?: boolean): void {
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
        src.unshift(of({data, lastModified: this.lastModified, total: this.total, scrollId: undefined}));
      }
      const worker = merge(...src, 1)
        .pipe(
          reduce(
            (ac, cur) => {
              ac.data = ac.data.concat(cur.data);
              if ( ac.lastModified.getTime() < cur.lastModified.getTime() ) {
                ac.total = cur.total;
                ac.lastModified = cur.lastModified;
              }
              return ac;
            },
            {data: [], total: 0, lastModified: new Date(0), scrollId: ''}));
      worker.subscribe(d => {
        subject.next(d.data);
      });
      workers.forEach(w => w.subscriptions--);
      this.cleanWorkers();
    }
  }

  private concatDate(d: DataExpectedResult<T>): void {
    this.total = d.total;
    if (this.lastModified.getTime() !== d.lastModified.getTime()) {
      this.externalModified = true;
    }
    this.lastModified = d.lastModified;
    // TODO d.scrollId isn't used
    this._update(d.data);
  }
  private _update(d: T[]): void {
    // TODO we need add new data to this cache without duplicate. This method need refactoring to increase performance
    d.forEach( e => {
      if (this.data.find(p => this.equalsData(p, e)) === undefined) {
        this.data.push(e);
      }
    });
  }
}
export class CdkDataSource<T> extends DataSource<T> {
  lstRange: ListRange = {start: 0, end: DEF_PORTION_SIZE};
  queryParams: any;
  orderParams: any;
  private subscription: Subscription;
  constructor(private main: MainDataSource<T>) {
    super();
  }
  connect(collectionViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>> {
    this.subscription = collectionViewer.viewChange.subscribe(r => {
      this.lstRange = r;
      this.main.obtainPage(this);
    });
    return this.main.consumers.get(this);
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.main.unregisterDS(this);
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
  sort(order: any): void {
    this.orderParams = order;
    this.main.obtainPage(this);
  }
  filter(query: any): void {
    this.queryParams = query;
    this.main.obtainPage(this);
  }
}
