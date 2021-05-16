import {Component, OnDestroy} from '@angular/core';
import {AbstractComponent, AbstractDataSource, SystemLang} from 'ui-lib';
// from x-payload
import {BannerType} from '../common/types';
import {SwaggerBannerType} from '../common/swagger-objects';
import {DataSources} from '../datasources';
import {RootPageService} from 'ui-lib';


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

  constructor(datasources: DataSources, public systemLang: SystemLang, protected rootPage: RootPageService) {
    super(systemLang, rootPage, {});
    this.dataSource = datasources.Banners;
  }
}
