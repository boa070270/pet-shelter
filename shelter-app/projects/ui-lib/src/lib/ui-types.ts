import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject, merge, Observable, Subject, Subscription} from 'rxjs';
import {FormConfiguration} from './forms/form-configuration';
import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {map, tap} from 'rxjs/operators';

export type FunctionGetId<T> = (v: T) => string;
export type FunctionGetColumnValue<T> = (element: T, column: string) => string;
export type FunctionGetColumnMedia<T> = (element: T, column: string) => ShowMediaType;

export class ObservableWithRefresh<T> extends BehaviorSubject<T[]> {

  constructor(source: Observable<T[]>, defaultValue: T[] = []) {
    super(defaultValue);
    source.subscribe((x) => {
      this.next(x);
    });
  }
  newSource(source: Observable<T[]>): void {
    source.subscribe((x) => {
      this.next(x);
    });
  }
}
export interface UIDataSource<T> extends DataSource<T> {
  select(filter?: any): Observable<T[]>;

  delete(rows: T[]): Observable<any>;

  insert(row: T): Observable<any>;

  update(row: T): Observable<any>;

  refresh(): void;
}
export abstract class BaseDataSource<T> implements UIDataSource<T> {
  // tslint:disable-next-line:variable-name
  protected readonly _dataStream: ObservableWithRefresh<T>;

  protected constructor(private source: Observable<T[]>, defaultValue: T[] = []) {
    this._dataStream = new ObservableWithRefresh<T>(source, defaultValue);
  }
  select(filterFun?: ((value: T, index: number) => boolean)): Observable<T[]> {
    if (filterFun) {
      return this._dataStream.pipe(map(v => v.filter(filterFun)));
    }
    return this._dataStream;
  }
  delete(rows: T[]): Observable<any> { return undefined; }
  insert(row: T): Observable<any> { return undefined; }
  update(row: T): Observable<any> { return undefined; }
  abstract refresh(): void;
  connect(collectionViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>> {
    return this._dataStream;
  }
  disconnect(collectionViewer: CollectionViewer): void {}
  close(): void {
    if (!this._dataStream.isStopped) {
      this._dataStream.complete();
    }
  }
}
interface StrPortionDS<T> {
  collViewer: CollectionViewer;
  subs: Subscription;
  subj: Subject<T[]>;
}
const RESOLVED_OBSERVER = new BehaviorSubject(true);
export abstract class PortionBaseDS<T> implements UIDataSource<T> {
  private collViewers: Array<StrPortionDS<T>> = [];
  private lastMerge: Observable<any> = RESOLVED_OBSERVER;
  private readonly subject: BehaviorSubject<T[]>;
  private lastIndex = 0;
  private activeLoading = 0;
  protected constructor(private source: Observable<T[]>, defaultValue: T[] = []) {
    this.subject = new BehaviorSubject<T[]>(defaultValue);
    source.subscribe(d => this.subject.next(d));
  }
  select(filterFun?: ((value: T, index: number) => boolean)): Observable<T[]> {
    if (filterFun) {
      return this.subject.pipe(map(v => v.filter(filterFun)));
    }
    return this.subject;
  }
  delete(rows: T[]): Observable<any> { return undefined; }
  insert(row: T): Observable<any> { return undefined; }
  update(row: T): Observable<any> { return undefined; }
  abstract refresh(): void;
  abstract loadPortion(start: number, end: number): Observable<any>;
  findCollViewer(collViewer: CollectionViewer): StrPortionDS<T> {
    return this.collViewers.find(v => v.collViewer === collViewer);
  }
  connect(collViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>> {
    let mediator = this.findCollViewer(collViewer);
    if (!mediator) {
      const subj = new Subject<T[]>();
      const subs = collViewer.viewChange.subscribe(n => this.checkPortion(n, subj));
      mediator = {collViewer, subs, subj};
      this.collViewers.push(mediator);
    }
    return mediator.subj;
  }
  disconnect(collViewer: CollectionViewer): void {
    const obj = this.findCollViewer(collViewer);
    if (obj) {
      obj.subs.unsubscribe();
      if (!obj.subj.isStopped) {
        obj.subj.complete();
      }
      this.collViewers = this.collViewers.filter(v => v !== obj);
    }
  }
  private _loadPortion(start: number, end: number): Observable<any> {
    this.activeLoading++;
    return merge(this.lastMerge, this.loadPortion(start, end).pipe(tap(d => {
      this.activeLoading--;
      if (!this.activeLoading) {
        this.lastMerge = RESOLVED_OBSERVER;
      }
      const data = this.subject.getValue();
      for (let i = 0; i <= data.length; i++) {
        data[i + start] = d[i];
      }
      })));
  }
  private checkPortion(range: ListRange, subj: Subject<T[]>): void {
    if (range) {
      if (this.lastIndex < range.end) {
        this.lastMerge = this._loadPortion(this.lastIndex, range.end);
        this.lastIndex = range.end;
      }
      merge(this.lastMerge).subscribe(() => {
        subj.next(this.subject.getValue().slice(range.start, range.end));
      });
    }
  }
}
/**
 * Interface is used to configure EditTableComponent
 */
export interface EditTableConfiguration<T> {
  readonly: boolean;
  /**
   * present function that return id of row
   */
  getId: FunctionGetId<T>;
  /**
   * extract column value
   */
  getColumnValue: FunctionGetColumnValue<T>;
  /**
   * if we want show media in column
   */
  getColumnMedia?: FunctionGetColumnMedia<T>;
  /**
   * all columns
   */
  allColumns: ColumnEditInfo[];
  /**
   * provide selected rows to EditTableComponent. The Id must be equal to row Id
   */
  selectedRows?: T[];
  /**
   * you can describe form or use components viewDialog, editDialog, newDialog
   */
  formConfiguration?: FormConfiguration<T>;
  /**
   * define users commands that will emit
   */
  extendCommands?: ExtendCommands[];
  /**
   * dataSource
   */
  dataSource: UIDataSource<T>;
  newItem?: () => T;
}

export interface TableEvent {
  command: CommandEnum;
  rows: any[];
  customCommand?: string;
}

export enum CommandEnum {
  refresh,
  delete,
  update,
  custom
}

export class ExtendCommands {
  iconName: string;
  menuName: string;
  commandName: string;
}

export interface ColumnEditInfo {
  displayed: boolean;
  isMedia: boolean;
  columnId: string;
  columnName: string;
}
export interface ShowMediaType {
  mediaType: string;
  mediaURI: string;
}
export function makeColumnInfo(columnId: string, columnName: string, displayed: boolean, isMedia: boolean): ColumnEditInfo {
  return {columnId, columnName, displayed, isMedia};
}

export const DefaultGetId: FunctionGetId<any> = (row) => row ? row.id : undefined;

export class Selector<T> {
  selected: Set<string>;

  constructor(private getId: FunctionGetId<T> = DefaultGetId, selected?: T[]) {
    this.selected = new Set<string>();
    if (selected) {
      selected.forEach(v => this.selected.add(getId(v)));
    }
  }

  hasValue(): boolean {
    return this.selected.size > 0;
  }

  isNotEmpty(): boolean {
    return this.selected.size > 0;
  }

  toggle(row: T): boolean {
    const id = this.getId(row);
    if (id) {
      if (this.selected.has(id)) {
        this.selected.delete(id);
        return false;
      } else {
        this.selected.add(id);
        return true;
      }
    }
  }

  isSelected(row: T): boolean {
    const id = this.getId(row);
    return id ? this.selected.has(id) : null;
  }

  clear(): void {
    this.selected.clear();
  }

  select(row: T): void {
    const id = this.getId(row);
    if (id) {
      this.selected.add(id);
    }
  }

  getSelected(): string[] {
    const result: string[] = [];
    this.selected.forEach(v => result.push(v));
    return result;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(dataSource: MatTableDataSource<T>): boolean {
    const numSelected = this.selected.size;
    const numRows = dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(dataSource: MatTableDataSource<T>): void {
    this.isAllSelected(dataSource) ?
      this.clear() :
      dataSource.data.forEach(row => this.select(row));
  }
}
