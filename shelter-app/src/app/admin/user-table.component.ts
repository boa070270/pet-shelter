import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {UserType} from '../common/types';
import {SwaggerUserType} from '../common/swagger-objects';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-user-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./user-table.component.sass'] // TODO change to ...
})
export class UserTableComponent {
  dataSource: AbstractDataSource<UserType>;
  swagger = SwaggerUserType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Users;
  }
}
