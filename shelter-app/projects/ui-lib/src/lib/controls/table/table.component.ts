import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {TableProviderService} from './table-provider.service';
import {DialogRef, DialogService} from '../../dialog-service';
import {
  AbstractDataSource,
  CdkDataSource,
  choiceFormat,
  coerceToSwaggerNative,
  DictionaryService,
  ExtendedData,
  I18NType,
  IOrder,
  PagingSize,
  SwaggerNative,
  SwaggerObject, TitleType
} from '../../shared';
import {SystemLang} from '../../i18n';
import {BaseComponent} from '../base.component';
import {CdkTable} from '@angular/cdk/table';
import {BehaviorSubject, merge} from 'rxjs';
import {Directionality} from '@angular/cdk/bidi';
import {reduce} from 'rxjs/operators';
import {ComponentType} from '@angular/cdk/overlay';

// i18n
const I18N: I18NType = {
    clearSelect: [{lang: 'en', title: 'Unselect all'}, {lang: 'uk', title: 'Скасувати вибір'}],
    refresh: [{lang: 'en', title: 'Refresh'}, {lang: 'uk', title: 'Оновити'}],
    settings: [{lang: 'en', title: 'Settings'}, {lang: 'uk', title: 'Налаштування'}],
    filter: [{lang: 'en', title: 'Filter'}, {lang: 'uk', title: 'Фільтр'}],
    editRow: [{lang: 'en', title: 'Edit'}, {lang: 'uk', title: 'Редагувати'}],
    viewRow: [{lang: 'en', title: 'View'}, {lang: 'uk', title: 'Переглянути'}],
    addRow: [{lang: 'en', title: 'Add'}, {lang: 'uk', title: 'Додати'}],
    deleteRows: [{lang: 'en', title: 'Delete'}, {lang: 'uk', title: 'Видалити'}],
    updated: [{lang: 'en', title: 'Row was updated'}, {lang: 'en', title: 'Рядок оновлено'}],
    added: [{lang: 'en', title: 'Row was added'}, {lang: 'en', title: 'Рядок добавлено'}],
    pageSize: [{lang: 'en', title: 'Rows per page'}, {lang: 'en', title: 'Рядків на сторінку'}],
    first: [{lang: 'en', title: 'First'}, {lang: 'en', title: 'Перша'}],
    last: [{lang: 'en', title: 'Last'}, {lang: 'en', title: 'Остання'}],
    prev: [{lang: 'en', title: 'Prev'}, {lang: 'en', title: 'Попередня'}],
    next: [{lang: 'en', title: 'Next'}, {lang: 'en', title: 'Наступна'}],
    askDelete: [
      {lang: 'en', title: 'Do you really want to delete {0,0# rows|1# row|[2..) rows}'},
      {lang: 'uk', title: 'Ви дійсно хочете видалити {0,0# рядків|1# рядок|[2..4] рядка|[5..) рядків}'},
      ],
    deleted: [
      {lang: 'en', title: 'Successfully was deleted {0,0# rows|1# row|[2..) rows}'},
      {lang: 'uk', title: 'Успішно видалено {0,0# рядків|1# рядок|[2..4] рядка|[5..) рядків}'},
      ],
    selected: [
      {lang: 'en', title: 'Selected: {0,0# rows|1# row|[2..) rows}'},
      {lang: 'uk', title: 'Вибрано: {0,0# рядків|1# рядок|[2..4] рядка|[5..) рядків}'},
    ]
};
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
  displayedNames: I18NType;
  @Input()
  dataSource: AbstractDataSource<any>;
  @Input()
  editForm: ComponentType<any> | TemplateRef<any>;
  @Input()
  viewForm: ComponentType<any> | TemplateRef<any>;
  @Input()
  newForm: ComponentType<any> | TemplateRef<any>;
  @Input()
  customActions: Array<{icon: string, tooltip: string | TitleType[], command: string}> = [];
  @Output()
  tableEvent: EventEmitter<{cmd: string, rows: any[]}> = new EventEmitter<{cmd: string; rows: any[]}>();
  private cdkDataSource: CdkDataSource<any>;
  displayedColumns: string[];
  allColumns: string[];
  actions: Array<{icon: string, tooltip: string, command: string}> = [];
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
              protected testTableService: TableProviderService,
              protected dialogService: DialogService,
              protected directionality: Directionality,
              dictionary: DictionaryService) {
    // TODO IE doesn't support assign, how angular solves this
    super(systemLang, directionality, Object.assign({}, I18N/*, dictionary.getDictionary('COMPONENTS') || {}.table */));
    this.swagger = testTableService.swagger;
    this.dataSource = testTableService.datasource;
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.pDisplayedNames = {};
    for (const key of this.displayedColumns) {
      this.pDisplayedNames[key] = this.doIfNeedI18n(this.displayedNames[key]);
    }
    if (this.customActions) {
      this.actions = [];
      for (const act of this.customActions) {
        this.actions.push({icon: act.icon, command: act.command, tooltip: this.doIfNeedI18n(act.tooltip)});
      }
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

  tableSettings(): void {
    const extDate = ExtendedData.create({columns: this.displayedColumns}, false,
      new SwaggerObject(['columns'],
        { columns: SwaggerNative.asString('list-builder', {enum: this.testTableService.columns})}),
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
      DIALOG_SEARCH, 'ok_cancel', this.i18n.filter, 'gm_search');
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
    let dialogRef;
    if (this.editForm) {
      dialogRef = this.dialogService.open(this.editForm, {data: this.currentRow});
    } else if (this.swagger) {
      dialogRef = this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, false, this.swagger, 'save_cancel'));
    }
    if (dialogRef) {
      dialogRef.afterClosed().subscribe( row => {
        if (row) {
          this.cdkDataSource.updateRow(row).subscribe( () => {
            this.dialogService.snakeInfo(this.i18n.updated);
          });
        }
      });
    }
  }

  viewRow(): void {
    this.closeDialog();
    if (this.viewForm) {
      this.dialogService.open(this.viewForm, {data: this.currentRow});
    } else if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, true, this.swagger, 'ok'));
    }
  }

  addRow(): void {
    this.closeDialog();
    let dialogRef;
    if (this.editForm) {
      dialogRef = this.dialogService.open(this.editForm, {data: this.currentRow});
    } else if (this.swagger) {
      dialogRef = this.dialogService.openExtDialog(ExtendedData.create({}, false, this.swagger, 'save_cancel'));
    }
    if (dialogRef) {
      dialogRef.afterClosed().subscribe( row => {
        if (row) {
          this.cdkDataSource.insertRow(row).subscribe( () => {
            this.dialogService.snakeInfo(this.i18n.added);
          });
        }
      });
    }
  }
  deleteRows(): void {
    this.closeDialog();
    if (this.selectedRows.length > 0) {
      this.dialogService.warnMsgDialog(choiceFormat(this.i18n.askDelete, this.selectedRows.length), true, 'yes_no')
        .afterClosed().subscribe( ok => {
         if (ok) {
           const observers = [];
           for (const row of this.selectedRows) {
             observers.push(this.cdkDataSource.deleteRow(row));
           }
           merge(...observers, 2).pipe(
             reduce((ac) => ac + 1, 0)
           ).subscribe( n => {
             this.dialogService.snakeInfo(choiceFormat(this.i18n.deleted, n));
           });
         }
      });
    }
  }
  customAction(cmd: string): void {
    if (this.selectedRows.length > 0) {
      this.tableEvent.next({cmd, rows: this.selectedRows});
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
