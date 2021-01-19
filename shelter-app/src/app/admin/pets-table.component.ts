import {Component, OnInit} from '@angular/core';
import {BaseDataSource, DynamicFormComponent, EditTableConfiguration, makeColumnInfo} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {FileType, PageType, PetType} from '../common/types';
import {fromPromise} from 'rxjs/internal-compatibility';
import {FormsConfigurationService} from './forms-configuration.service';
import {SystemLang} from 'ui-lib';
import {FieldsService} from '../fields.service';
import {FilesTableComponent} from './files-table.component';

class DataSource extends BaseDataSource<PetType> {

  constructor(private service: BasicService) {
    super(service.getPets());
  }

  delete(rows: PetType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deletePet(r.id).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: PetType): Observable<any> {
    return this.service.addPet(row);
  }

  update(row: PetType): Observable<any> {
    return this.service.updatePet(row);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getPets());
  }
}
const EMPTY_ERR = [];

@Component({
  selector: 'app-pets-table',
  templateUrl: './pets-table.component.html',
  styleUrls: ['./pets-table.component.sass'] // TODO change to ...
})
export class PetsTableComponent implements OnInit {
  tableConfiguration: EditTableConfiguration<PetType>;
  panel = 0;

  constructor(public dialog: MatDialog, private service: BasicService,
              private formsConfiguration: FormsConfigurationService,
              private systemLang: SystemLang,
              private fieldsService: FieldsService) {
  }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: new DataSource(this.service),
      // x-payload => everything in type TODO if object or array or number change to corresponding blanks
      newItem: () => this.formsConfiguration.petNewItem(),
      getId: (r) => '' + r.id,
      getColumnValue: (element, column) => {
        if (column === 'fields' && element.fields) {
          const f = element.fields.map(v => this.fieldsService.fieldValueAsString(v, this.systemLang));
          return f.join(', ');
        }
        return element[column];
      },
      getColumnMedia: (element, column) => {
        if (column === 'ref' && element.ref && element.ref.length > 0) {
          return {mediaType: element.ref[0].mimeType, mediaURI: '/api/v1/assets/' + element.ref[0].refId};
        }
      },
      allColumns: [
        makeColumnInfo('id', 'Id', true, false),
        makeColumnInfo('fields', 'Fields', true, false),
        makeColumnInfo('ref', 'Ref', true, true),
      ],

      formConfiguration: this.formsConfiguration.petFormConfiguration(),
    };
  }
  update(dialogRef: any, form: DynamicFormComponent<PetType>, assets: FilesTableComponent): void {
    if (dialogRef) {
      const data = form.getData();
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
