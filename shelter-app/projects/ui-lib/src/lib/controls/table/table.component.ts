import {Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TableProviderService} from './table-provider.service';
import {DialogService} from '../../dialog-service';
import {
  AbstractDataSource, CdkDataSource, PagingSize,
  coerceToSwaggerNative,
  ExtendedData, IOrder,
  SwaggerNative,
  SwaggerObject,
  TitleType
} from '../../shared';
import {SystemLang} from '../../i18n';
import {BaseComponent} from '../base.component';
import {CdkTable} from '@angular/cdk/table';
import {BehaviorSubject, merge} from 'rxjs';
import {DialogRef} from '../../dialog-service';
import {Directionality} from '@angular/cdk/bidi';
import {reduce} from 'rxjs/operators';

const DIALOG_SEARCH = new SwaggerObject(['search'], { search: SwaggerNative.asString()});
@Component({
  selector: 'lib-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends BaseComponent implements OnInit, OnDestroy {
  readonly PagingSize = PagingSize;
  get pageSize(): number {
    return (this.cdkDataSource || {}).pageSize;
  }
  set pageSize(p: number) {
    if (this.cdkDataSource) {
      this.cdkDataSource.pageSize = p;
    }
  }

  @Input()
  swagger: SwaggerObject;
  @Input()
  displayedNames: {[column: string]: string | TitleType[]};
  @Input()
  dataSource: AbstractDataSource<any>;
  private cdkDataSource: CdkDataSource<any>;
  displayedColumns: string[];
  allColumns: string[];
  @ViewChild(CdkTable, {static: true}) cdkTable: CdkTable<any>;
  @ViewChild('inputSearch', {static: true}) inputSearch: ElementRef<HTMLInputElement>;
  @ViewChild('dlg') dlgTemplate: TemplateRef<any>;
  pDisplayedNames: {[column: string]: string};
  get selectedRows(): any[] {
    return this.cdkDataSource.selectedRows;
  }
  orderIcons = {};
  get order(): IOrder[] {
    return (this.cdkDataSource || {}).orderParams || [];
  }
  get maxPage(): number {
    return (this.cdkDataSource || {}).maxPage;
  }
  get currentPage(): number {
    return (this.cdkDataSource || {}).currentPage;
  }
  set currentPage(n: number) {
    if (this.cdkDataSource) {
      this.cdkDataSource.currentPage = n;
    }
  }
  private currentRow = null;
  private tableViewChange: BehaviorSubject<{ start: number; end: number }>; // needs to use table.viewChange directly
  private dialogRef: DialogRef<any> = null;
  private dialogTimer: any = null;

  constructor(public systemLang: SystemLang,
              private testTableService: TableProviderService,
              private dialogService: DialogService,
              protected directionality: Directionality) {
    super(systemLang, directionality);
    this.swagger = testTableService.swagger;
    this.dataSource = testTableService.datasource;
  }
  onChangeLang(): void {
    this.pDisplayedNames = {};
    for (const key of this.displayedColumns) {
      this.pDisplayedNames[key] = this.doIfNeedI18n(this.displayedNames[key]);
    }
  }
  ngOnInit(): void {
    if (this.swagger) {
      this.allColumns = [];
      this.displayedColumns = [];
      this.displayedNames = {};
      for (const [key, value] of Object.entries(this.swagger.properties)) {
        if (coerceToSwaggerNative(value)) {
          const native = value as SwaggerNative;
          this.allColumns.push(key);
          this.displayedNames[key] = (native.ui || {}).caption || key;
        }
      }
      for (const n of this.swagger.orderControls) {
        if (this.allColumns.includes(n)) {
          this.displayedColumns.push(n);
        }
      }
      this.caption = (this.swagger.ui || {}).caption;
      this.hint = (this.swagger.ui || {}).description;
    }
    super.ngOnInit();
    this.onChangeLang();
    this.cdkDataSource = this.dataSource.registerDS();
    this.cdkTable.dataSource = this.cdkDataSource;
    this.tableViewChange = this.cdkTable.viewChange;
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.dataSource.unregisterDS(this.cdkDataSource);
    this.dataSource = null;
    this.closeDialog();
  }

  headerClick(): void {
    const extDate = ExtendedData.create({columns: this.displayedColumns}, false,
      new SwaggerObject(['columns'],
        { columns: SwaggerNative.asString('list-builder', {enums: this.testTableService.columns})}),
      'save_cancel', '');
    const dialogRef = this.dialogService.infoExtDialog(extDate, true);
    dialogRef.afterClosed().subscribe(v => {
      if (typeof v === 'object' && v !== null) {
        this.displayedColumns = v.columns;
      }
    });
  }

  clickSearch(): void {
    if (window.getComputedStyle(this.inputSearch.nativeElement).display === 'none') {
      this.showSearchDialog();
    }
  }
  showSearchDialog(): void {
    const extDate = ExtendedData.create({search: this.inputSearch.nativeElement.value}, false,
      DIALOG_SEARCH, 'ok_cancel', 'Filter', 'gm_search');
    const dialogRef = this.dialogService.infoExtDialog(extDate);
    dialogRef.afterClosed().subscribe(v => {
      if (typeof v === 'object' && v !== null) {
        this.inputSearch.nativeElement.value = v.search;
        this.cdkDataSource.filter(this.inputSearch.nativeElement.value);
      }
    });
  }
  keyUp(): void {
    this.cdkDataSource.filter(this.inputSearch.nativeElement.value);
  }
  private closeDialog(): void {
    if (this.dialogRef !== null) {
      this.dialogRef.close();
    }
    if (this.dialogTimer !== null) {
      clearTimeout(this.dialogTimer);
      this.dialogTimer = null;
    }
  }

  rowClick(row: any): void {
    this.currentRow = row;
    const i = this.selectedRows.indexOf(row);
    if (i >= 0) {
      this.selectedRows.splice(i, 1);
    } else {
      this.selectedRows.push(row);
    }
    this.closeDialog();
    this.dialogRef = this.dialogService.snakeFromTemplate(this.dlgTemplate);
    this.dialogTimer = setTimeout(() => { this.closeDialog(); }, 5000);
  }

  clearSelect(): void {
    this.cdkDataSource.clearSelectedRows();
    this.closeDialog();
  }

  refresh(): void {
    this.cdkDataSource.refresh();
    this.closeDialog();
  }

  editRow(): void {
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, false, this.swagger, 'save_cancel'))
        .afterClosed().subscribe( row => {
        if (row) {
          this.cdkDataSource.updateRow(row).subscribe( () => {
            this.dialogService.snakeInfo('Row was updated');
          });
        }
      });
    }
  }

  viewRow(): void {
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, true, this.swagger, 'ok'));
    }
  }
  addRow(): void {
    console.log('Table.addRow');
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create({}, false, this.swagger, 'save_cancel'))
        .afterClosed().subscribe( row => {
        if (row) {
          this.cdkDataSource.insertRow(row).subscribe( () => {
            this.dialogService.snakeInfo('Row was inserted');
          });
        }
      });
    }
  }
  deleteRows(): void {
    console.log('Table.deleteRows');
    this.closeDialog();
    if (this.selectedRows.length > 0) {
      this.dialogService.warnMsgDialog(`Do you really want to delete ${this.selectedRows.length} rows`, true, 'yes_no')
        .afterClosed().subscribe( ok => {
         if (ok) {
           const observers = [];
           for (const row of this.selectedRows) {
             observers.push(this.cdkDataSource.deleteRow(row));
           }
           merge(...observers, 2).pipe(
             reduce((ac) => ac + 1, 0)
           ).subscribe( n => {
             this.dialogService.snakeInfo(`Successfully was deleted ${n} rows`);
           });
         }
      });
    }
  }

  orderCell(col: string): void {
    const i = this.order.findIndex( v => v.p === col);
    if (i < 0) {
      this.order.push({p: col, order: 1});
      this.orderIcons[col] = 'table-order-asc';
    } else if (this.order[i].order === 1) {
      this.orderIcons[col] = 'table-order-desc';
      this.order[i].order = -1;
    } else {
      this.orderIcons[col] = null;
      this.order.splice(i, 1);
    }
    this.cdkDataSource.sort(this.order);
  }
  changePage(n: number): void {
    this.currentPage = n;
  }
  incPage(n: number): void {
    this.currentPage += n;
  }

}
