import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {PetType} from '../common/types';
import {SwaggerPetType as SwaggerPetType} from '../common/swagger-objects';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-pets-table',
  template: `
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./pets-table.component.sass'] // TODO change to ...
})
export class PetsTableComponent {
  dataSource: AbstractDataSource<PetType>;
  swagger = SwaggerPetType;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Pets;
  }
}
