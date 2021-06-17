import { Component, OnInit } from '@angular/core';
import {FieldTypeUI, SwaggerFieldType} from '../common';
import {AbstractDataSource, SwaggerArray, SwaggerNative, SwaggerObject, swaggerUI} from 'ui-lib';
import {DsType} from './ds.service';
import {DataSources} from '../datasources';

const I18N = {
  ds: [{ lang: 'en', title: 'Datasource name' }, { lang: 'ua', title: 'Назва джерела даних' }],
  fld: [{ lang: 'en', title: 'Field name' }, { lang: 'ua', title: 'Назва поля' }],
  description: [{ lang: 'en', title: 'Datasource description' }, { lang: 'ua', title: 'Опис джерела даних' }],
  pk: [{ lang: 'en', title: 'Use as primary key?' }, { lang: 'ua', title: 'Використовувати як первинний ключ?' }],
  type: [{ lang: 'en', title: 'Type of field' }, { lang: 'ua', title: 'Тип поля' }],
};

@Component({
  selector: 'app-ds',
  template: `
  <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
`,
  styleUrls: ['./ds.component.sass']
})
export class DsComponent {
  dataSource: AbstractDataSource<DsType>;
  swagger = new SwaggerObject(
    ['ds', 'description', 'fields'],
    {
      ds: SwaggerNative.asString(undefined, {maxLength: 16, minLength: 1}, swaggerUI(I18N.ds)),
      description: new SwaggerObject(['description'], {
        description: SwaggerNative.asString(undefined, undefined, swaggerUI(I18N.description))
      }),
      fields: new SwaggerArray(new SwaggerObject(
        ['field', 'pk', 'type'],
        {
          field: SwaggerNative.asString(
            undefined,
            {minLength: 1, maxLength: 16}, swaggerUI(I18N.fld)),
          pk: SwaggerNative.asBoolean(undefined, undefined, swaggerUI(I18N.pk)),
          type: SwaggerNative.asString(
            'lib-select-control',
            {enum: ['', 'number', 'string', 'date'], minLength: 1}, swaggerUI(I18N.type))
        }, undefined, ['field', 'type']), {control: 'lib-editable-list'})
    }, undefined, ['ds']
  );

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Ds;
  }

}
