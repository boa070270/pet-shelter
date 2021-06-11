import {Component, OnInit, ViewChild} from '@angular/core';
import {DsDataService, DsDataType, DsFldTypeEnum, DsService, DsType} from "./ds.service";
import {AbstractDataSource, MainDataSource, SwaggerArray, SwaggerNative, SwaggerObject, SelectControlComponent} from 'ui-lib';
import {DataSources} from "../datasources";

@Component({
  selector: 'app-ds-data',
  template: `
    <lib-select-control [options]="dsNames"></lib-select-control>
  <lib-table *ngIf="selected" [dataSource]="dataSource" [swagger]="swagger" [defaultDisplay]="display"></lib-table>
`,
  styleUrls: ['./ds-data.component.sass']
})
export class DsDataComponent implements OnInit {
  ds: DsType[];
  dsNames: string[] = [''];
  dataSource: AbstractDataSource<DsDataType>;
  swagger: SwaggerObject;
  @ViewChild(SelectControlComponent, {static: true}) select: SelectControlComponent;
  selected = false;
  display = [];

  constructor(protected dsService: DsService, protected dsDataService: DsDataService) {
    dsService.obtainData().subscribe(value => {
      this.ds = value.data;
      this.ds.forEach(v => {
        this.dsNames.push(v.ds);
      });
    });
    this.dataSource = new MainDataSource(this.dsDataService, 20, 100, ALL_EQUAL, ALL_EQUAL);
  }
  ngOnInit(): void {
    this.select.registerOnChange(c => {
      this.onChoose(c);
    });
  }
  onChoose(ds): void {
    if (!ds) {
      return;
    }
    this.selected = true;
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
    this.display = orderCtrl;
    this.swagger = new SwaggerObject([...orderCtrl, 'ctid'], {ctid: SwaggerNative.asString(undefined, {readOnly: true}),
      ...properties}, undefined, required, undefined, {ctid: [{c: '!0', hide: ['ctid']}]});
    this.dsDataService.obtainData().subscribe(d => {
      console.log('ds Data dsDataService', d.data); // [{ctid, data}]
      this.dataSource.setData(d.data);
    });
  }
}
const ALL_EQUAL = () => true;
