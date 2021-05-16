import {Component, OnDestroy, ViewContainerRef} from '@angular/core';
import {AbstractComponent, AbstractDataSource} from 'ui-lib';
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
export class BannersTableComponent extends AbstractComponent implements OnDestroy {
  dataSource: AbstractDataSource<BannerType>;
  swagger = SwaggerBannerType;

  // tslint:disable-next-line:variable-name
  constructor(protected _view: ViewContainerRef, datasources: DataSources) {
    super(_view);
    this.dataSource = datasources.Banners;
  }
}
