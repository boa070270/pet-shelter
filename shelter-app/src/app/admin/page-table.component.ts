import {Component, OnInit} from '@angular/core';
import {BaseDataSource, DynamicFormComponent, EditTableConfiguration, makeColumnInfo} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {FileType, PageType} from '../common/types';
import {fromPromise} from 'rxjs/internal-compatibility';
import {FormsConfigurationService} from './forms-configuration.service';
import {EditorComponent} from '@bilousd/angular-wysiwyg-editor-lib';
import {FilesTableComponent} from './files-table.component';

class DataSource extends BaseDataSource<PageType>{

  constructor(private service: BasicService) {
    super(service.getPages());
  }

  delete(rows: PageType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deletePage(r.id).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: PageType): Observable<any> {
    return this.service.addPage(row);
  }

  update(row: PageType): Observable<any> {
    return this.service.updatePage(row);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getPages());
  }
}
const EMPTY_ERR = [];
@Component({
  selector: 'app-page-table',
  templateUrl: './page-table.component.html',
  styleUrls: ['./page-table.component.sass'] // TODO change to ...
})
export class PageTableComponent implements OnInit {
  tableConfiguration: EditTableConfiguration<PageType>;
  panel = 0;
  plugins: Array<{
    selector: string;
    attributes: string[];
  }> = [
    {selector: 'app-carousel', attributes: ['resource', 'lang', 'count']},
    {selector: 'app-lengthen-list', attributes: ['resource', 'query', 'displayAs', 'defLang']}
    ];

  constructor(public dialog: MatDialog, private service: BasicService, private formsConfiguration: FormsConfigurationService) { }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: new DataSource(this.service),
      newItem: () => this.formsConfiguration.pageNewItem(),
      getId: (r) => '' + r.id,
      getColumnValue: (element, column) => {
        return element[column];
      },
      getColumnMedia: (element, column) => {
        if (column === 'ref' && element.ref && element.ref.length > 0) {
          return {mediaType: element.ref[0].mimeType, mediaURI: '/api/v1/assets/' + element.ref[0].refId};
        }
      },
      allColumns: [
        makeColumnInfo('id', 'Id', true, false),
        makeColumnInfo('lang', 'Lang', true, false),
        makeColumnInfo('title', 'Title', true, false),
        makeColumnInfo('summary', 'Summary', true, false),
        makeColumnInfo('body', 'Body', false, false),
        makeColumnInfo('score', 'Score', true, false),
        makeColumnInfo('draft', 'Draft', true, false),
        makeColumnInfo('tags', 'Tags', true, false),
        makeColumnInfo('restriction', 'Restriction', true, false),
        makeColumnInfo('menuId', 'Menu', true, false),
        makeColumnInfo('ref', 'Ref', true, true),
      ],
      formConfiguration: this.formsConfiguration.pageFormConfiguration(),
    };
  }

  update(dialogRef: any, form: DynamicFormComponent<PageType>, editor: EditorComponent, assets: FilesTableComponent): void {
    console.log(form, editor);
    if (dialogRef) {
      const data = form.getData();
      data.body = editor.getInnerHTML();
      const files = assets.getSelectedRows();
      if (files.length > 0) {
        data.ref = files.map(v => ({refId: v.id, mimeType: v.mimeType}));
      }
      dialogRef.close(data);
    }
  }

  dropImage($event: DragEvent): void {
    console.log($event);
  }

  selectedRows(data: PageType): FileType[] {
    if (data.ref && data.ref.length > 0) {
      return data.ref.map(v => ({id: v.refId, mimeType: v.mimeType, encoding: '', originalName: '', size: ''}));
    }
    return EMPTY_ERR;
  }

  opened(panel: number): void {
    this.panel = panel;
  }

  closed(data, assets: FilesTableComponent, panel: number): void {
    if (panel === 2) {
      const files = assets.getSelectedRows();
      if (files.length > 0) {
        data.ref = files.map(v => ({refId: v.id, mimeType: v.mimeType}));
      }
    }
  }
}
