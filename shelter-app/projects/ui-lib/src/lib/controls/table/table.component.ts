import {Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, Type} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {SystemLang} from '../../i18n';
import {TitleType} from '../../shared';
import {BaseComponent} from '../base.component';
import {TableControl} from './table-control';

@Component({
  selector: 'lib-table-control',
  // templateUrl: './table-control.component.html',
  template: `
  <table libTableControl>
  <caption>{{caption}}</caption>
  <tr><th *ngFor="let cell of displayedColumns">{{cell}}</th></tr>
  <tr *ngFor="let row of data" [libTableRowSelector]="row">
    <td *ngFor="let cell of displayedColumns" [libTableCellData]="cell">{{row[cell]}}</td>
  </tr>
  </table>`,
  styleUrls: ['./table.component.scss'],
  providers: [TableControl]
})
export class TableComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  set observableData(d: Observable<ReadonlyArray<any>>) {
    this.tableControl.setObservableData(d);
  }
  @Input()
  set columns(d: string[]) {
    this.tableControl.setColumns(d);
  }
  @Input()
  set fnEqual(fn: (a: any, b: any) => boolean) {
    this.tableControl.setFnEqual(fn);
  }
  @Input()
  set columnTypes(t: {[cell: string]: (row: any, cell: string) => string | Type<any>}) {
    this.tableControl.setColumnTypes(t);
  }
  @Input() filtered: boolean;
  @Input() stickied: boolean;
  @Input() rowNumbers: boolean;
  @Output()
  get selectedRows(): Subject<ReadonlyArray<any>> {
    return this.tableControl.selectedRows;
  }
  @Output()
  get selectRow(): Subject<any> {
    return this.tableControl.selectRow;
  }
  data: ReadonlyArray<any>;
  displayedColumns: string[];
  columnTitles: ReadonlyArray<{[cell: string]: string | TitleType[]}>;
  pColumnTitles: {[cell: string]: string};
  private dataSubscription: Subscription;
  private columnSubscription: Subscription;

  constructor(public systemLang: SystemLang, public tableControl: TableControl) {
    super(systemLang);
    console.log('TableControlComponent.constructor');
    this.dataSubscription = tableControl.dataModify.subscribe(d => this.data = d);
    this.columnSubscription = tableControl.columnsModify.subscribe(d => this.displayedColumns = d);
  }
  onChangeLang(): void {
    this.pColumnTitles = this.doIfNeedI18n(this.columnTitles, {});
    super.onChangeLang();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('TableControlComponent.ngOnChanges');
    super.ngOnChanges(changes);
  }
  ngOnInit(): void {
    super.ngOnInit();
    this.tableControl.init();
  }
  ngOnDestroy(): void {
    console.log('TableControlComponent.ngOnDestroy');
    super.ngOnDestroy();
    this.dataSubscription.unsubscribe();
    this.columnSubscription.unsubscribe();
  }
}