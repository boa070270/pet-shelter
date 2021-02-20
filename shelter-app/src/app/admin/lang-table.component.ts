import {Component, OnInit} from '@angular/core';
import {AbstractDataSource, LanguageType} from 'ui-lib';
import {DataSources} from '../datasources';
import {SwaggerLanguageType} from '../common/swagger-objects';
@Component({
  selector: 'app-lang-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./lang-table.component.sass'] // TODO change to ...
})
export class LangTableComponent {
  dataSource: AbstractDataSource<LanguageType>;
  swagger = SwaggerLanguageType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Language;
  }
}
