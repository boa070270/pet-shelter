import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {
  AbstractDataSource,
  CdkDataSource,
  CUSTOM_DS_SERVICE,
  CustomDSService,
  DsDataType,
  DsFldTypeEnum,
  DsType, SwaggerNative, SwaggerObject
} from '../shared';
import {SelectControlComponent, TableComponent} from '../controls';

@Component({
  selector: 'app-ds-data',
  template: `
    <lib-select-control [options]="dsNames"></lib-select-control>
  <lib-table *ngIf="swagger" [dataSource]="dataSource" [swagger]="swagger" [defaultDisplay]="display" #table></lib-table>
`,
  styleUrls: ['./ds-data.component.sass']
})
export class DsDataComponent implements OnInit {
  ds: AbstractDataSource<DsType>;
  dsNames: string[] = [''];
  dataSource: AbstractDataSource<DsDataType>;
  swagger: SwaggerObject;
  @ViewChild(SelectControlComponent, {static: true}) select: SelectControlComponent;
  @ViewChild('table') table: TableComponent<any, any>;
  display = [];
  private cdk: CdkDataSource<DsType, any>;

  constructor(@Inject(CUSTOM_DS_SERVICE) private customDSRepo: CustomDSService){
    this.ds = customDSRepo.obtainDS('ds');
    if (this.ds) {
      // this.cdk = this.ds.registerDS();
    }
    this.dataSource = customDSRepo.obtainDS('dsDataType');
  }
  ngOnInit(): void {
    this.select.registerOnChange(c => {
      this.onChoose(c);
      return c;
    });
  }
  onChoose(ds): void {
    if (!ds) {
      return;
    }
    const fields = []; // this.ds.find(d => d.ds === ds).fields;
    // this.dsDataService.ds = ds;
    // this.dsDataService.fields = fields;
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
    if (this.table) { // update manually, because table can't do it
      this.table.defaultDisplay = orderCtrl;
      this.table.swagger = this.swagger;
      this.table.ngOnInit();
      this.table.refresh();
    }
  }
}
const ALL_EQUAL = () => true;
