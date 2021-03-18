import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {FieldTypeUI} from '../common/types';
import {SwaggerFieldType} from '../common/swagger-objects';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-fields-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./fields-table.component.sass']
})
export class FieldsTableComponent {
  dataSource: AbstractDataSource<FieldTypeUI>;
  swagger = SwaggerFieldType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Fields;
  }
}
