import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {PageType} from '../common';
import {SwaggerPageType} from '../common';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-page-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./page-table.component.sass'] // TODO change to ...
})
export class PageTableComponent {
  dataSource: AbstractDataSource<PageType>;
  swagger = SwaggerPageType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Pages;
  }
}
