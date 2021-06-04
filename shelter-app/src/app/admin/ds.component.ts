import { Component, OnInit } from '@angular/core';
import {FieldTypeUI, SwaggerFieldType} from '../common';
import {AbstractDataSource} from 'ui-lib';
import {DsDatasource, DsType} from './ds.service';
import {DataSources} from "../datasources";
import {SwaggerArray, SwaggerNative, SwaggerObject} from "../../../projects/ui-lib/src/lib/shared";

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
    ['ds', 'fields'],
    {
      ds: SwaggerNative.asString(),
      fields: new SwaggerArray(new SwaggerObject(
        ['field', 'pk', 'type'],
        {
          field: SwaggerNative.asString(
            undefined,
            {minLength: 1, maxLength: 10}),
          pk: SwaggerNative.asBoolean(),
          type: SwaggerNative.asString(
            undefined,
            { enum: [ 'number', 'string', 'date']})
        }), {control: 'lib-editable-list'})
    }
  );

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Ds;
  }

}
