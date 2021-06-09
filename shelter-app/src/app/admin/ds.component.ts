import { Component, OnInit } from '@angular/core';
import {FieldTypeUI, SwaggerFieldType} from '../common';
import {AbstractDataSource, SwaggerArray, SwaggerNative, SwaggerObject} from 'ui-lib';
import {DsType} from './ds.service';
import {DataSources} from '../datasources';

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
      ds: SwaggerNative.asString(undefined, {maxLength: 16, minLength: 1}),
      description: SwaggerNative.asString(),
      fields: new SwaggerArray(new SwaggerObject(
        ['field', 'pk', 'type'],
        {
          field: SwaggerNative.asString(
            undefined,
            {minLength: 1, maxLength: 16}),
          pk: SwaggerNative.asBoolean(),
          type: SwaggerNative.asString(
            'lib-select-control',
            {enum: ['number', 'string', 'date']})
        }, undefined, ['field', 'type']), {control: 'lib-editable-list'})
    }, undefined, ['ds']
  );

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Ds;
  }

}
