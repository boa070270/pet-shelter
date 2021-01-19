import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseDataSource, EditTableConfiguration, makeColumnInfo} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {convertFieldsToFieldArray, FieldAndTitlesType} from '../common/types';
import {map} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import {FormsConfigurationService} from './forms-configuration.service';

@Component({
  selector: 'app-fields-table',
  templateUrl: './fields-table.component.html',
  styleUrls: ['./fields-table.component.sass']
})
export class FieldsTableComponent implements OnInit, OnDestroy {
  tableConfiguration: EditTableConfiguration<FieldAndTitlesType>;

  constructor(public dialog: MatDialog, private service: BasicService, private formsConfiguration: FormsConfigurationService) {}

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: this.service.getFieldsDataSource(),
      newItem: () => this.formsConfiguration.fieldNewItem(),
      getId: (r) => '' + r.field.name,
      getColumnValue: (element, column) => {
        switch (column) {
          case 'name':
            return element.field.name;
          case 'type':
            return element.field.type.toString();
          case 'subtype':
            return element.field.subtype;
          case 'enumValues':
            return element.field.enumValues;
          case 'titles':
            return element.titles.map(value => value.lang + ':' + value.title).join(',');
        }
      },
      allColumns: [
        makeColumnInfo('name', 'Field name', true, false),
        makeColumnInfo('type', 'Field type', true, false),
        makeColumnInfo('subtype', 'Subtype', true, false),
        makeColumnInfo('enumValues', 'Enum value', false, false),
        makeColumnInfo('titles', 'Titles', true, false),
      ],
      formConfiguration: this.formsConfiguration.fieldFormConfiguration()
    };
  }

  ngOnDestroy(): void {
  }

}
