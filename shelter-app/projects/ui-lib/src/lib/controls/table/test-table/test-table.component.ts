import {Component, ElementRef, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TestTableService} from './test-table.service';
import {DialogService} from '../../../dialog-service';
import {coerceToSwaggerNative, ExtendedData, SwaggerNative, SwaggerObject, TitleType} from '../../../shared';
import {SystemLang} from '../../../i18n';
import {BaseComponent} from '../../base.component';
import {CdkTable} from "@angular/cdk/table";
import {BehaviorSubject} from "rxjs";
import {DialogRef} from "@angular/cdk-experimental/dialog";

const DIALOG_SEARCH: SwaggerObject = {
  orderControls: ['search'],
  properties: {
    search: {
      controlType: 'input',
      type: 'string',
    }
  }
};
@Component({
  selector: 'lib-test-table',
  // templateUrl: './test-table.component.html',
  template: `<table cdk-table>
    <caption>
      <div class="table-caption-block">
        <select>
          <option>10</option>
          <option>20</option>
          <option>50</option>
          <option>100</option>
        </select>
        <strong>Simple table's caption</strong>
        <label>
            <span class="gm-search"></span>
            <input #inputSearch type="text" class="table-search" (click)="clickSearch($event)" (keyup)="keyUp()">
            <span></span>
        </label>
      </div>
    </caption>
    <ng-container *ngFor="let col of allColumns" cdkColumnDef="{{col}}" >
      <th cdk-header-cell *cdkHeaderCellDef> {{pDisplayedNames[col]}} </th>
      <td cdk-cell *cdkCellDef="let element"> {{element[col]}} </td>
    </ng-container>

    <tr cdk-header-row *cdkHeaderRowDef="displayedColumns" (click)="headerClick()"></tr>
    <tr cdk-row *cdkRowDef="let row; columns: displayedColumns;" (click)="rowClick(row)" [ngClass]="{'table-mark-row': selectedRows.includes(row)}"></tr>
  </table>
  <ng-template #dlg>
    <button (click)="clearSelect()">Unselect all</button>
    <button (click)="refresh()">Refresh</button>
    <button (click)="editRow()">Edit</button>
    <button (click)="viewRow()">View</button>
    <button (click)="addRow()">Add</button>
  </ng-template>`,
  styleUrls: ['./test-table.component.scss']
})
export class TestTableComponent extends BaseComponent implements OnInit {
  @Input()
  swagger: SwaggerObject;
  @Input()
  displayedNames: {[column: string]: string | TitleType[]};
  @Input()
  dataSource;
  displayedColumns: string[];
  allColumns: string[];
  @ViewChild(CdkTable, {static: true}) cdkTable: CdkTable<any>;
  @ViewChild('inputSearch', {static: true}) inputSearch: ElementRef<HTMLInputElement>;
  @ViewChild('dlg') dlgTemplate: TemplateRef<any>;
  pDisplayedNames: {[column: string]: string};
  selectedRows = [];
  private currentRow = null;
  private tableViewChange: BehaviorSubject<{ start: number; end: number }>; // needs to use table.viewChange directly
  private dialogRef: DialogRef<any> = null;
  private dialogTimer: any = null;

  constructor(public systemLang: SystemLang,
              private testTableService: TestTableService,
              private dialogService: DialogService) {
    super(systemLang);
    this.swagger = testTableService.swagger;
    this.dataSource = testTableService.datasource;
  }
  onChangeLang(): void {
    this.pDisplayedNames = {};
    for (const [key, value] of Object.entries(this.displayedColumns || {})) {
      this.pDisplayedNames[key] = this.doIfNeedI18n(value);
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
    this.onChangeLang();
    this.cdkTable.dataSource = this.dataSource;
    this.tableViewChange = this.cdkTable.viewChange;
  }

  headerClick(): void {
    const extDate = ExtendedData.create({columns: this.displayedColumns}, false,
      {
        orderControls: ['columns'],
        properties: {
          columns: {
            controlType: 'list-builder',
            type: 'string',
            constrictions: {
              enums: this.testTableService.columns
            }
          }
        }
      }, 'save_cancel', '');
    const dialogRef = this.dialogService.infoExtDialog(extDate, true);
    dialogRef.afterClosed().subscribe(v => {
      if (typeof v === 'object' && v !== null) {
        this.displayedColumns = v.columns;
      }
    });
  }

  clickSearch(event): void {
    console.log(window.getComputedStyle(this.inputSearch.nativeElement).display);
    if (window.getComputedStyle(this.inputSearch.nativeElement).display === 'none') {
      console.log('need to show dialog');
      const extDate = ExtendedData.create({search: this.inputSearch.nativeElement.value}, false, DIALOG_SEARCH, 'ok', 'Filter', 'gm_search');
      const dialogRef = this.dialogService.infoExtDialog(extDate);
      dialogRef.afterClosed().subscribe(v => {
        if (typeof v === 'object' && v !== null) {
          this.inputSearch.nativeElement.value = v.search;
          console.log(this.inputSearch.nativeElement.value);
        }
      });
    }
  }

  keyUp(): void {
    console.log(this.inputSearch);
    console.log(this.inputSearch.nativeElement.value);
    console.log(window.getComputedStyle(this.inputSearch.nativeElement).display);
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
  private editRow(): void {
    console.log('Table.editRow');
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, false, this.swagger, 'save_cancel'));
    }
  }

  viewRow(): void {
    console.log('Table.viewRow');
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, true, this.swagger, 'save_cancel'));
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
    this.dialogRef = this.dialogService.openFromTemplate(this.dlgTemplate, {hasBackdrop: false});
    this.dialogTimer = setTimeout(() => { this.closeDialog(); }, 3000);
  }

  clearSelect(): void {
    this.selectedRows = [];
    this.closeDialog();
  }

  refresh(): void {
    if (this.dataSource && typeof this.dataSource.refresh === 'function') {
      this.dataSource.refresh();
    }
    this.closeDialog();
  }

  addRow(): void {
    console.log('Table.addRow');
    this.closeDialog();
    if (this.swagger) {
      this.dialogService.openExtDialog(ExtendedData.create(this.currentRow, true, this.swagger, 'save_cancel'));
    }
  }
}
