import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PeriodicElement, SwaggerFormService, SwaggerNative, SwaggerObject, TableProviderService} from 'ui-lib';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataSource} from '@angular/cdk/collections';

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
  swagger: SwaggerObject = new SwaggerObject(
    ['id', 'description', 'child'],
  {
      id: SwaggerNative.asString(),
      description: SwaggerNative.asString(),
      child: new SwaggerObject(
        ['childId', 'childDescription', 'sex'],
        {
          childId: SwaggerNative.asString(),
          childDescription: SwaggerNative.asString(),
          sex: SwaggerNative.asString( null, {enums: ['m', 'f']})
        })
      });
  @ViewChild('insertHere', {static: true}) insertHere: ElementRef<HTMLDivElement>;
  innerHtml: any;

  constructor(private swaggerFormService: SwaggerFormService, private tableProviderService: TableProviderService) {
    swaggerFormService.addSchemaIfNotExists('test', this.swagger);
    tableProviderService.setTableSwagger('test', TableSwagger);
    tableProviderService.setDataSource('test', new ExampleDataSource());
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

export class ExampleDataSource extends DataSource<any> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<any[]>(tableDataSet);

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect(): void {}
}
