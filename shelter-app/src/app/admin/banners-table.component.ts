import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseDataSource, EditTableConfiguration, makeColumnInfo} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {BannerType} from '../common/types';
import {fromPromise} from 'rxjs/internal-compatibility';
import {FormsConfigurationService} from './forms-configuration.service';

class DataSource extends BaseDataSource<BannerType> {

  constructor(private service: BasicService) {
    super(service.getBanners());
  }

  delete(rows: BannerType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deleteBanner(r.id).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: BannerType): Observable<any> {
    return this.service.addBanner(row);
  }

  update(row: BannerType): Observable<any> {
    return this.service.updateBanner(row);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getBanners());
  }
}

@Component({
  selector: 'app-banners-table',
  templateUrl: './banners-table.component.html',
  styleUrls: ['./banners-table.component.sass'] // TODO change to ...
})
export class BannersTableComponent implements OnInit, OnDestroy {
  tableConfiguration: EditTableConfiguration<BannerType>;

  constructor(public dialog: MatDialog, private service: BasicService, private formConfiguration: FormsConfigurationService) {
  }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: new DataSource(this.service),
      newItem: () => this.formConfiguration.bannerNewItem(),
      // TODO change to ... ?
      getId: (r) => '' + r.id,
      getColumnValue: (element, column) => {
        switch (column) {
          case 'id':
            return element.id;
          case 'score':
            return element.score;
          case 'lang':
            return element.lang;
          case 'targetUrl':
            return element.ref.targetUrl;
          case 'tooltip':
            return element.ref.tooltip;
        }
        return element[column];
      },
      getColumnMedia: (element, column) => {
        if (column === 'ref') {
          return {mediaType: element.ref.mimeType, mediaURI: '/api/v1/assets/' + element.ref.refId};
        }
      },
      allColumns: [
        makeColumnInfo('id', 'Id', true, false),
        makeColumnInfo('score', 'Score', true, false),
        makeColumnInfo('lang', 'Lang', true, false),
        makeColumnInfo('targetUrl', 'Target URL', true, false),
        makeColumnInfo('tooltip', 'Tooltip', true, false),
        makeColumnInfo('ref', 'Ref', true, true),
      ],
      formConfiguration: this.formConfiguration.bannerFormConfiguration(),
    };
  }
  ngOnDestroy(): void {
  }

}
