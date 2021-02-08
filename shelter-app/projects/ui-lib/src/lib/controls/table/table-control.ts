import {Injectable, OnDestroy, Type} from '@angular/core';
import {BehaviorSubject, isObservable, Observable, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * This injectable class contain all data that is binding to table
 */
@Injectable()
export class TableControl implements OnDestroy {
  /**
   * function that can two rows
   */
  fnEqual: (a: any, b: any) => boolean;
  /**
   * contains types of columns
   */
  columnTypes: { [p: string]: (row: any, cell: string) => string | Type<any>};
  /**
   * contains all data
   * @private
   */
  private pData: ReadonlyArray<any>;
  set data(d: ReadonlyArray<any>){
    this.pData = d;
    console.log('TableControl emit data', d);
    this.dataModify.next(this.pData);
  }

  /**
   * contains all columns
   */
  allColumns: string[];
  /**
   * contain names of columns
   * @private
   */
  private pDisplayedColumns: string[];

  /**
   * contains displayed columns
   * @param ss
   */
  set displayedColumns(ss: string[]) {
    this.pDisplayedColumns = ss;
    console.log('TableControl emit columns', ss);
    this.columnsModify.next(this.pDisplayedColumns);
  }
  get  displayedColumns(): string[] {
    return this.pDisplayedColumns;
  }
  destroy: Subject<any> = new Subject();
  dataModify: Subject<any> = new BehaviorSubject([]);
  columnsModify: Subject<string[]> = new BehaviorSubject([]);
  selectedRows: Subject<ReadonlyArray<any>> = new BehaviorSubject<ReadonlyArray<any>>([]);
  private selected: Array<any>;
  selectRow: Subject<any> = new BehaviorSubject<any>(null);
  private dataSubscription: Subscription;
  private columnSubscription: Subscription;
  // tslint:disable-next-line:variable-name
  private dataObservable: Observable<ReadonlyArray<any>>;
  // tslint:disable-next-line:variable-name
  private columnsObservable: Observable<string[]>;

  constructor() {
    console.log('TableControl.constructor');
  }
  ngOnDestroy(): void {
    console.log('TableControl.ngOnDestroy');
    this.unsubscribeData();
    this.unsubscribeCollumns();
    this.destroy.next(true);
    this.destroy.complete();
    this.selectedRows.complete();
    this.selectRow.complete();
  }

  setObservableData(d: Observable<ReadonlyArray<any>>): void {
    if (isObservable(d)) {
      this.unsubscribeData();
      this.dataObservable = d;
      this.dataSubscription = this.dataObservable.pipe(takeUntil(this.destroy)).subscribe(n => this.data = n);
    }
  }
  getObservableData(): Observable<ReadonlyArray<any>> {
    return this.dataObservable;
  }
  setColumns(d: string[]): void {
    console.log('TableControl.setColumns', d);
    this.allColumns = d;
    this.displayedColumns = [...d];
  }

  setFnEqual(fn: (a: any, b: any) => boolean): void {
    this.fnEqual = fn;
  }

  setColumnTypes(t: {[p: string]: (row: any, cell: string) => string | Type<any>}): void {
    this.columnTypes = t;
  }

  init(): void {
  }
  toggleSelected(row: any): void {
    const i = this.selected.indexOf(row);
    if (i >= 0) {
      this.selected.splice(i, 1);
    }
  }
  private unsubscribeData(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  private unsubscribeCollumns(): void {
    if (this.columnSubscription) {
      this.columnSubscription.unsubscribe();
    }
  }
}
