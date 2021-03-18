import {Observable, Subject, Subscription} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

export function equals(lst1: ListRange, lst2: ListRange): boolean {
  return lst1.start === lst2.start && lst1.end === lst2.end;
}
/**
 * check is no intersect and no connect
 * @param lst1: ListRange
 * @param lst2: ListRange
 */
export function noIntersect(lst1: ListRange, lst2: ListRange): boolean {
  return lst1.start > lst2.end || lst1.end < lst2.start;
}
/**
 * returns array of ListRange that intersect with lst
 * @param lst: ListRange
 * @param lists: ListRange[]
 */
export function include(lst: ListRange, lists: ListRange[]): ListRange[] {
  return lists.filter(lr => !noIntersect(lr, lst));
}

/**
 * returns collections of absent and present ListRange's that can be united to one lst
 * @param lst: ListRange
 * @param lists: ListRange[]
 */
export function sortOut(lst: ListRange, lists: ListRange[]): {absent: ListRange[], present: ListRange[]} {
  const present = include(lst, lists).sort((a, b) => a.start - b.start);
  const absent: ListRange[] = [];
  if (present.length > 0) {
    let start = lst.start;
    for (const l of present) {
      if (start < l.start) {
        absent.push({start, end: l.start});
      }
      start = l.end;
    }
    if (start < lst.end) {
      absent.push({start, end: lst.end});
    }
  } else {
    absent.push(lst);
  }
  return {absent, present};
}

/**
 * calculate ListRange when page size is changed
 * @param lst ListRange
 * @param pSize new page size
 */
export function newPageSize(lst: ListRange, pSize: number): ListRange {
  if (lst.start === 0) {
    return {start: 0, end: pSize};
  } else {
    const start = Math.floor(lst.start / pSize);
    return {start, end: start + pSize};
  }
}

/**
 * calculate ListRange for page number and page size
 * @param pageSize number of records on one page
 * @param page page number, the first page is 0
 */
export function changePage(pageSize: number, page: number): ListRange {
  return {start: page * pageSize, end: page * pageSize + pageSize};
}

export const PagingSize = [10, 20, 50, 100];

/**
 * Class that in charge of paging functions
 * It's used by TableComponent and CdkDataSource
 */
export class Paging {

  private _size = 0;

  private _pageSize = PagingSize[0];
  protected listRange: ListRange = {start: 0, end: 0};
  private subs: Subscription;
  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(n: number) {
    if (n !== this._pageSize) {
      this._pageSize = n;
      this.listRange = newPageSize(this.listRange, n);
      this.subject.next(this.listRange);
    }
  }
  set size(n: number) {
    if (this._size !== n) {
      if (this.listRange.start !== this.listRange.end) {
        if (this.listRange.start + this._pageSize > this._size && this._size < n) {
          this.subject.next(this.listRange);
        } else if (n < this.listRange.end) {
          this.listRange.start = Math.floor(n / this._pageSize);
          this.listRange.end = this.listRange.start + this._pageSize;
          this.subject.next(this.listRange);
        }
      }
      this._size = n;
    }
  }
  get size(): number {
    return this._size;
  }
  get maxPage(): number {
    return Math.ceil(this._size / this._pageSize);
  }
  get page(): number {
    return this.listRange.start / this._pageSize;
  }

  /**
   * Create Paging
   * @param subject - is used to send event to change page
   * @param total - is used to obtain size of DataSource
   */
  constructor(protected subject: Subject<ListRange>, protected total: Observable<number>) {
    this.subs = total.subscribe( n => this.size = n);
  }
  destroy(): void {
    this.subs.unsubscribe();
  }
  incrementPage(n: number): void {
    const np = this.page + n;
    if ( np >= 0 && np < this.maxPage) {
      this.toPage(np);
    }
  }
  setPage(n: number): void {
    if (n >= 0 && n < this.maxPage && (n !== this.page || this._size === 0)) {
      this.toPage(n);
    }
  }
  protected toPage(n: number): void {
    this.listRange = changePage(this._pageSize, n);
    this.subject.next(this.listRange);
  }
}

/**
 * This class allow paging that is cycled
 * DB has 0..4
 * Page size is 3
 * next: [0..3)
 * next: [2..5)
 * next: [0..3)
 */
export class CyclePaging extends Paging {
  constructor(subject: Subject<ListRange>, protected total: Observable<number>) {
    super(subject, total);
  }
  next(): void {
    if (this.listRange.start + this.pageSize > this.size) {
      this.listRange.start = this.size - this.pageSize;
      this.listRange.end = this.size;
    } else if (this.listRange.start + this.pageSize === this.size) {
      this.listRange.start = 0;
      this.listRange.end = this.pageSize;
    } else {
      this.listRange.start = 0;
      this.listRange.end = this.pageSize;
    }
    this.subject.next(this.listRange);
  }
}

/**
 * Class tu return subarray by rule:
 * source is [1..4]
 * length is 3
 * next: [1,2,3]
 * next: [2,3,4]
 * next: [3,4,1]
 * next: [4,1,2]
 * next: [1,2,3]
 */
export class CycleSlice<T> {
  private len: number;
  private pos = 0;
  constructor(private source: T[], length: number) {
    this.len = length;
  }
  set length(len: number) {
    this.len = len;
  }
  next(): T[] {
    const res = [];
    while (this.pos < this.source.length && res.length <= this.len) {
      res.push(this.source[this.pos++]);
      if (this.pos === this.source.length) {
        this.pos = 0;
      }
    }
    return res;
  }
}
