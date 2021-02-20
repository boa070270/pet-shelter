import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {MenuTypeUI} from '../common/types';
import {SwaggerMenuType} from '../common/swagger-objects';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-menu-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./menu-table.component.sass'] // TODO change to ...
})
export class MenuTableComponent {
  dataSource: AbstractDataSource<MenuTypeUI>;
  swagger = SwaggerMenuType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Menu;
  }
}
