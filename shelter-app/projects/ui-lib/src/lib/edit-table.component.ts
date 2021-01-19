import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  ColumnEditInfo,
  CommandEnum,
  EditTableConfiguration,
  ExtendCommands,
  FunctionGetColumnMedia,
  FunctionGetColumnValue,
  Selector,
  TableEvent
} from './ui-types';
import {MatTableDataSource} from '@angular/material/table';
import {ColumnEditorComponent} from './column-editor.component';
import {YesNoDialogComponent} from './yes-no-dialog.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ComponentType} from '@angular/cdk/overlay';
import {DynamicFormDialogComponent} from './forms/dynamic-form-dialog.component';

@Component({
  selector: 'lib-edit-table',
  templateUrl: './edit-table.component.html',
  styleUrls: ['./edit-table.component.scss']
})
export class EditTableComponent<T> implements OnInit {

  @Input() configuration: EditTableConfiguration<T>;
  /**
   * define dialog to view row
   */
  @Input() viewDialog: ComponentType<T> | TemplateRef<T>;
  /**
   * define dialog to edit row
   */
  @Input() editDialog: ComponentType<T> | TemplateRef<T>;
  /**
   * define dialog to make new row
   */
  @Input()  newDialog: ComponentType<T> | TemplateRef<T>;
  @Input()  title: string;
  @Output() emitRows = new EventEmitter<TableEvent>();
  @Input()  showMenu = true;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  extendCommands: ExtendCommands[];
  getColumnValue: FunctionGetColumnValue<T>;
  getColumnMedia: FunctionGetColumnMedia<T>;
  selection: Selector<T>;
  dataSource: MatTableDataSource<T>;
  selectionHighlighted: Selector<T>;
  columns: ColumnEditInfo[];
  columnsWithSelect: string[];
  resultsLength = 0;
  rowClickCount = 0;
  canAdd = true;
  canDelete = true;
  canEdit = true;
  canView = true;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    if (!this.configuration) {
      throw new TypeError('configuration must be present');
    }
    this.selection = new Selector(this.configuration.getId, this.configuration.selectedRows);
    this.selectionHighlighted = new Selector(this.configuration.getId);
    this.columnsWithSelect = ['#select'];
    this.columns = this.configuration.allColumns.filter(c => {
      if (c.displayed){
        this.columnsWithSelect.push(c.columnId);
        return true;
      }
    });
    this.extendCommands = this.configuration.extendCommands || [];
    this.getColumnValue = this.configuration.getColumnValue;
    this.getColumnMedia = this.configuration.getColumnMedia;
    this.dataSource = new MatTableDataSource<T>([]);
    this.configuration.dataSource.select().subscribe(data => {
      this.dataSource.data = data;
      this.resultsLength = data.length;
    });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.configuration.readonly) {
        this.canAdd = false;
        this.canDelete = false;
        this.canEdit = false;
    } else if ( !this.configuration.formConfiguration ) {
        if (!this.viewDialog) {
            this.view = () => {};
            this.canView = false;
        }
        if (!this.editDialog) {
            this.canEdit = false;
        }
        if (!this.newDialog) {
            this.canAdd = false;
        }
    }
    if (!this.canDelete) {
        this.delete = () => {};
    }
    if (!this.canEdit) {
        this.edit = () => {};
    }
    if (!this.canAdd) {
        this.add = () => {};
    }
  }

  applyDataFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }

  delete(): void {
    const rows = this.getSelectedRows();
    if (rows.length > 0) {
      const msg = rows.length > 1 ? rows.length + ' rows' : 'this row';
      const dialogRef = this.dialog.open(YesNoDialogComponent, {
        // width: '400px',
        data: {msg: 'Do you really want do delete ' + msg}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selection.clear();
          this.configuration.dataSource.delete(rows).subscribe(() => {
            this.configuration.dataSource.refresh();
          });
          this.emitRows.emit({
            command: CommandEnum.delete,
            rows
          });
        }
      });
    }
  }
  _selectRows(selector: Selector<T>): T[] {
    if (selector) {
      const data = this.dataSource.data;
      return data.filter(r => selector.isSelected(r));
    }
    return [];
  }
  getSelectedRows(): T[] {
    return this._selectRows(this.selection);
  }

  refresh(): void {
    this.configuration.dataSource.refresh();
    this.emitRows.emit({
      command: CommandEnum.refresh,
      rows: []
    });
  }

  columnEditor(): void {
    const data: ColumnEditInfo[] = this.configuration.allColumns;
    const dialogRef = this.dialog.open(ColumnEditorComponent, {
      width: '600px',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0){
        this.columnsWithSelect = ['#select'];
        this.columns = result.filter(c => {
          if (c.displayed) {
            this.columnsWithSelect.push(c.columnId);
          }
          return c.displayed;
        });
      }
    });
  }

  customMenu(customCommand: string): void {
    const rows = this.getSelectedRows();
    this.emitRows.emit({
      command: CommandEnum.custom,
      rows,
      customCommand
    });
  }

  rowClick(row: any): void {
    this.rowClickCount++;
    setTimeout(() => {
      this.selectionHighlighted.clear();
      this.selectionHighlighted.select(row);
      if (this.rowClickCount === 1) {
        this.emitRows.emit({
          command: CommandEnum.update,
          rows: [row]
        });
      } else if (this.rowClickCount === 2) {
        this.view();
      }
      this.rowClickCount = 0;
    }, 250);
  }
  _openDialog(dialog: ComponentType<T> | TemplateRef<T>, data: T, readonly: boolean = false): MatDialogRef<any> {
    if (dialog) {
      return this.dialog.open(dialog, {data, maxHeight: '80vh'});
    } else if (this.configuration.formConfiguration) {
      this.configuration.formConfiguration.options.readonly = readonly;
      return this.dialog.open(DynamicFormDialogComponent, {
        maxHeight: '80vh',
        data: {
          configuration: this.configuration.formConfiguration,
          data
        }
      });
    }
  }
  _merge(dest: any, source: any): any {
    if (source) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'object') {
          dest[key] = this._merge(Array.isArray(dest[key]) ? [] : {}, value);
        }
        dest[key] = value;
      }
    }
    return dest;
  }
  _selectedRow(): T {
    const newItem = this.configuration.newItem ? this.configuration.newItem() : {};
    const rows = this._selectRows(this.selectionHighlighted);
    return this._merge(newItem, rows[0]);
  }
  openViewDialog(): MatDialogRef<any> {
    if (this.selectionHighlighted.hasValue()) {
      return this._openDialog(this.viewDialog, this._selectedRow(), true);
    }
  }
  openEditDialog(): MatDialogRef<any> {
    if (this.selectionHighlighted.hasValue()) {
      return this._openDialog(this.editDialog, this._selectedRow(), false);
    }
  }
  openNewDialog(): MatDialogRef<any> {
    return this._openDialog(this.newDialog, this.configuration.newItem ? this.configuration.newItem() : {} as T, true);
  }
  view(): void {
      this.openViewDialog();
  }
  add(): void {
    const dialog = this.openNewDialog();
    if (dialog) {
      dialog.afterClosed().subscribe(data => {
          if (data) {
              const observable = this.configuration.dataSource.insert(data);
              if (observable) {
                  observable.subscribe(() => this.configuration.dataSource.refresh());
              }
          }
      });
    }
  }

  edit(): void {
    const dialog = this.openEditDialog();
    if (dialog) {
      dialog.afterClosed().subscribe(data => {
        if (data) {
          const observable = this.configuration.dataSource.update(data);
          if (observable) {
              observable.subscribe(() => this.configuration.dataSource.refresh());
          }
        }
      });
    }
  }
}
