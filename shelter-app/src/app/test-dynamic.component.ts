import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {
  AbstractDataSource,
  ArrayDataSource,
  DialogService,
  SwaggerArray,
  SwaggerFormService,
  SwaggerNative,
  SwaggerObject,
  swaggerUI,
  TableProviderService,
  TitleType
} from 'ui-lib';
import {BasicService} from './basic.service';
import {Validators} from "@angular/forms";

@Component({
  selector: 'app-test-dynamic',
  // templateUrl: './test-dynamic.component.html',
  template: `
    <div>
      <h1>Dynamic page</h1>
      <div #insertHere></div>
<!--      <lib-dynamic-page></lib-dynamic-page>-->
      <textarea [(ngModel)]="textHtml"></textarea>
      <select [(ngModel)]="knownText" (change)="onChange()">
        <option value="a">Text Hello</option>
        <option value="b">Generator form</option>
        <option value="d">Table</option>
        <option value="e">CdkTable</option>
      </select>
      <button (click)="onClick()">Render</button>
      <h1>Swagger builder test</h1>
      <lib-swagger-builder [swagger]="swag"></lib-swagger-builder>
<!--      <lib-swagger-form [swagger]="formSwagger"></lib-swagger-form>-->
    </div>
  `,
  styleUrls: ['./test-dynamic.component.sass']
})
export class TestDynamicComponent implements OnInit {
  textHtml: string;
  knownTexts = {
    a: '<span>Hello world!</span>',
    b: '<lib-generator-form-element #form swagger="test"></lib-generator-form-element>',
    // c: '<lib-swagger-form swagger=""></lib-swagger-form>'
    d: '<lib-table-generator-element schema="test"></lib-table-generator-element>',
    e: '<test-table-element></test-table-element>'
  };
  knownText: any;
  swag: SwaggerObject = new SwaggerObject(
    ['id'],
    {
      id: SwaggerNative.asNumber()
    });
  swagger: SwaggerObject = new SwaggerObject(
    ['id', 'description', 'child'],
  {
      id: SwaggerNative.asNumber(),
      description: SwaggerNative.asString(),
      child: new SwaggerObject(
        ['childId', 'childDescription', 'sex'],
        {
          childId: SwaggerNative.asString(),
          childDescription: SwaggerNative.asString(),
          sex: SwaggerNative.asString( null, {enum: ['m', 'f']})
        })
      });
  formSwagger: SwaggerObject = new SwaggerObject(
    ['id', 'constraintMinMax', 'formatNumber', 'description', 'description1', 'description2', 'description3', 'description4',
      'description5', 'description6', 'description7', 'description8', 'description9', 'description90', 'description91', 'description92',
      'description93', 'description94'],
    {
      id: SwaggerNative.asNumber(),
      constraintMinMax: SwaggerNative.asNumber(null, {minimum: 1, maximum: 5}),
      formatNumber: SwaggerNative.asNumber(null, {format: 'number',
        validators: [Validators.min(1), Validators.max(5)]}),
      description: SwaggerNative.asString(),
      description1: SwaggerNative.asString(),
      description2: SwaggerNative.asString(),
      description3: SwaggerNative.asString(),
      description4: SwaggerNative.asString(),
      description5: SwaggerNative.asString(),
      description6: SwaggerNative.asString(),
      description7: SwaggerNative.asString(),
      description8: SwaggerNative.asString(),
      description9: SwaggerNative.asString(),
      description90: SwaggerNative.asString(),
      description91: SwaggerNative.asString(),
      description92: SwaggerNative.asString(),
      description93: SwaggerNative.asString(),
      description94: SwaggerNative.asString(),
    });

  change: EventEmitter<any>;
  dataSource: AbstractDataSource<any>;
  @ViewChild('insertHere', {static: true}) insertHere: ElementRef<HTMLDivElement>;
  innerHtml: any;

  constructor(private swaggerFormService: SwaggerFormService, private tableProviderService: TableProviderService,
              protected  basicService: BasicService,
              protected  dialogService: DialogService) {
    swaggerFormService.addSchemaIfNotExists('test', this.swagger);
    tableProviderService.setTableSwagger('test', TableSwagger);
    tableProviderService.setDataSource('test', new ArrayDataSource(tableDataSet));
  }

  ngOnInit(): void {
  }

  onClick(): void {
    this.insertHere.nativeElement.innerHTML = this.textHtml;
    this.innerHtml = this.textHtml;
  }

  onChange(): void {
    this.textHtml = this.knownTexts[this.knownText];
  }

}

/******* Table *******/
const TableSwagger = new SwaggerObject(
  ['position', 'name', 'weight', 'symbol', 'colA', 'colB', 'colC', 'colD', 'colE'],
  {
    position: SwaggerNative.asNumber(),
    name: SwaggerNative.asString(),
    weight: SwaggerNative.asNumber(),
    symbol: SwaggerNative.asString(),
  });

const tableDataSet = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];
