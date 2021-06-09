import { Component, OnInit } from '@angular/core';
import {DsDataService, DsDataType, DsFldTypeEnum, DsService, DsType} from "./ds.service";
import {AbstractDataSource, SwaggerArray, SwaggerNative, SwaggerObject} from 'ui-lib';
import {DataSources} from "../datasources";
import {MainDataSource} from "../../../projects/ui-lib/src/lib/shared";
import {BasicService} from "../basic.service";

@Component({
  selector: 'app-ds-data',
  template: `
    <lib-select-control [options]=""></lib-select-control>
  <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
`,
  styleUrls: ['./ds-data.component.sass']
})
export class DsDataComponent {
  ds: DsType[];
  dsNames: string[];
  dataSource: AbstractDataSource<DsDataType>;
  swagger: SwaggerObject;

  constructor(datasources: DataSources, protected dsService: DsService, protected dsDataService: DsDataService) {
    dsService.obtainData().subscribe(value => {
      this.ds = value.data;
      this.ds.forEach(v => {
        this.dsNames.push(v.ds);
      });
    });
    this.dataSource = new MainDataSource(this.dsDataService, 20, 100, ALL_EQUAL, ALL_EQUAL);
  }
  onChoose(ds): void {
    const fields = this.ds.find(d => d.ds === ds).fields;
    this.dsDataService.ds = ds;
    this.dsDataService.fields = fields;
    const orderCtrl = [];
    const properties = {};
    const required = [];
    fields.forEach(f => {
      orderCtrl.push(f.field);
      switch (f.type) {
        case DsFldTypeEnum.string:
          properties[f.field] = SwaggerNative.asString();
          break;
        case DsFldTypeEnum.number:
          properties[f.field] = SwaggerNative.asNumber();
          break;
        case DsFldTypeEnum.date:
          properties[f.field] = SwaggerNative.asString(undefined, {format: 'date'});
          break;
      }
      if (f.pk) {
        required.push(f.field);
      }
    });
    this.swagger = new SwaggerObject(orderCtrl, properties, undefined, required);
  }
}
const ALL_EQUAL = () => true;
