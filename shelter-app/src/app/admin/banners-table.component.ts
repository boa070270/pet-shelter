import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {BannerType} from '../common/types';
import {SwaggerBannerType} from '../common/swagger-objects';
import {DataSources} from '../datasources';


@Component({
  selector: 'app-banners-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./banners-table.component.sass'] // TODO change to ...
})
export class BannersTableComponent {
  dataSource: AbstractDataSource<BannerType>;
  swagger = SwaggerBannerType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Banners;
  }
}
