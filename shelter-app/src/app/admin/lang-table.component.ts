import {Component, OnInit} from '@angular/core';
import {
  BuilderFieldControlConfiguration,
  EditTableConfiguration,
  EnumInputType,
  makeColumnInfo
} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {LanguageType} from '../common/types';

@Component({
  selector: 'app-lang-table',
  templateUrl: './lang-table.component.html',
  styleUrls: ['./lang-table.component.sass'] // TODO change to ...
})
export class LangTableComponent implements OnInit {
  tableConfiguration: EditTableConfiguration<LanguageType>;

  constructor(public dialog: MatDialog, private service: BasicService) { }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: this.service.getLangDataSource(),
      newItem: () => ({lang: '', displayName: '', rate: 0}),
      getId: (r) => r.lang,
      getColumnValue: (element, column) => {
        return element[column];
      },
      allColumns: [
        makeColumnInfo('lang', 'Lang', true, false),
        makeColumnInfo('displayName', 'DisplayName', true, false),
        makeColumnInfo('rate', 'Rate', true, false),
       ],

      formConfiguration: {
        options: {
          readonly: false,
          appearance: 'standard',
          formClass: 'form-class'
        },
        controls: [ {
              formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
              controlName: 'lang',
              hint: 'Please, input lang',
              title: 'Lang',
              placeholder: 'There is unique lang',
              required: true,
              matFormFieldClass: 'field-class',
              immutable: true,
          },
          {
              formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
              controlName: 'displayName',
              hint: 'Please, input displayName',
              title: 'DisplayName',
              placeholder: 'There is unique displayName',
              required: true,
              matFormFieldClass: 'field-class',
              immutable: true,
          },
          {
              formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
              controlName: 'rate',
              hint: 'Please, input rate',
              title: 'Rate',
              placeholder: 'There is unique rate',
              required: true,
              matFormFieldClass: 'field-class',
              immutable: true,
          },
        ]
      },
    };
  }

}
