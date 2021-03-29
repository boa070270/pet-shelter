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
      <h1>Array form test</h1>
      <lib-swagger-form [swagger]="formSwagger" [(ngModel)]="data"></lib-swagger-form>
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
          sex: SwaggerNative.asString( null, {enum: ['m', 'f']})
        })
      });
  i18n = {
    act_up: [{lang: 'en', title: 'Move one position up'}, {lang: 'uk', title: 'Підняти на одну позицію'}],
    act_down: [{lang: 'en', title: 'Move one position down'}, {lang: 'uk', title: 'Опустити на одну позицію'}]
  };
  actions: Array<{icon: string, tooltip: string | TitleType[], command: string, action: (v) => void}> = [
    {icon: 'gm-keyboard_arrow_up', command: 'move-up', tooltip: this.i18n.act_up, action: (v) => { this.moveUp(v); }},
    {icon: 'gm-keyboard_arrow_down', command: 'move-down', tooltip: this.i18n.act_down, action: (v) => { this.moveDown(v); }}
  ];
  formSwagger: SwaggerObject = new SwaggerObject(
    ['fields'],
    {
      fields: new SwaggerArray(
        new SwaggerObject(
          ['fieldName', 'fieldType', 'itemType', 'nativeType', 'objectLink', 'required',
            'constriction', 'nativeConstrictions', 'numberConstrictions', 'stringConstrictions',
            'arrayConstrictions', 'objectConstrictions', 'ui'],
          {
            order: SwaggerNative.asInteger(null, {default: 0},
              swaggerUI(null, [{lang: 'en', title: ''}, {lang: 'uk', title: 'Обов\'язкове поле'}])),
            fieldName: SwaggerNative.asString(),
            fieldType: SwaggerNative.asString(null,
              {enum: ['SwaggerNative', 'SwaggerArray', 'SwaggerObject'], default: 'SwaggerNative'}),
            constriction: new SwaggerObject(
              ['control', 'validators', 'asyncValidator'],
              {
                control: SwaggerNative.asString(),
                validators: SwaggerNative.asString(), // ??? write as string and parse to function later?
                asyncValidator: SwaggerNative.asString(), // ???
              }
            ),
            nativeConstrictions: new SwaggerObject(
              ['readOnly', 'immutable', 'writeOnly', 'nullable', 'enum',
                'enumDescriptions', 'enumTooltips', 'enumMulti', 'default', 'format'],
              {
                readOnly: SwaggerNative.asBoolean(),
                immutable: SwaggerNative.asBoolean(),
                writeOnly: SwaggerNative.asBoolean(),
                nullable: SwaggerNative.asBoolean(),
                enum: SwaggerNative.asString(), // ??? array as string separated by ','?
                enumDescriptions: SwaggerNative.asString(), // ???
                enumTooltips: SwaggerNative.asString(),
                enumMulti: SwaggerNative.asBoolean(),
                default: SwaggerNative.asString(),
                format: SwaggerNative.asString(null,
                  {enum: ['date', 'date-time', 'password', 'byte', 'binary', 'email', 'uuid', 'uri', 'hostname',
                      'ipv4', 'ipv6', 'color', 'datetime-local', 'month', 'number', 'search', 'tel', 'text', 'time', 'week']}),
              }
            ),
            numberConstrictions: new SwaggerObject(
              ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'],
              {
                minimum: SwaggerNative.asNumber(),
                maximum: SwaggerNative.asNumber(),
                exclusiveMinimum: SwaggerNative.asNumber(),
                exclusiveMaximum: SwaggerNative.asNumber(),
                multipleOf: SwaggerNative.asNumber()
              }
            ),
            stringConstrictions: new SwaggerObject(
              ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'],
              {
                minimum: SwaggerNative.asNumber(),
                maximum: SwaggerNative.asNumber(),
                exclusiveMinimum: SwaggerNative.asNumber(),
                exclusiveMaximum: SwaggerNative.asNumber(),
                multipleOf: SwaggerNative.asNumber()
              }
            ),
            arrayConstrictions: new SwaggerObject(
              ['minItems', 'maxItems', 'uniqueItems', 'customTableActions', 'trIn', 'trOut'],
              {
                minLength: SwaggerNative.asNumber(),
                maxLength: SwaggerNative.asNumber(),
                pattern: SwaggerNative.asString()
              }
            ),
            objectConstrictions: new SwaggerObject(
              ['orderCtrl', 'toFrm', 'fromFrm'],
              {
                orderCtrl: SwaggerNative.asString(), // ???
                toFrm: SwaggerNative.asString(), // ???
                fromFrm: SwaggerNative.asString() // ???
              }
            ),
            itemType: SwaggerNative.asString(null, {enum: ['SwaggerNative', 'SwaggerObject']}),
            nativeType: SwaggerNative.asString(null,
              {enum: ['string', 'number', 'integer', 'boolean'], default: 'string'}),
            objectLink: SwaggerNative.asString(),
            ui: new SwaggerObject(
              ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
              {
                description: SwaggerNative.asString(), // ??? try to parse as TitleType and leave as string if fails?
                caption: SwaggerNative.asString(), // ???
                toolTip: SwaggerNative.asString(), // ???
                placeHolder: SwaggerNative.asString(), // ???
                leadingIcon: SwaggerNative.asString(),
                trailingIcon: SwaggerNative.asString(),
                nameAsCaption: SwaggerNative.asBoolean(),
              }
            ),
            required: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Required'}, {lang: 'uk', title: 'Обов\'язкове поле'}])),
          }, null, ['fieldName', 'fieldType'], null,
          {
            fieldType: [
              // {c: '!SwaggerNative,SwaggerObject,SwaggerArray',
              // hide: ['itemType', 'nativeType', 'objectLink']}, // required and default, so no use?
              {c: '=SwaggerNative',
                hide: ['itemType', 'objectLink', 'objectConstrictions', 'arrayConstrictions'],
                show: ['nativeType', 'nativeConstrictions']},
              {c: '=SwaggerObject',
                hide: ['itemType', 'nativeType', 'nativeConstrictions', 'arrayConstrictions', 'stringConstrictions', 'numberConstrictions'],
                show: ['objectLink', 'objectConstrictions']},
              {c: '=SwaggerArray',
                hide: ['nativeConstrictions', 'objectConstrictions', 'stringConstrictions', 'numberConstrictions'],
                show: ['itemType', 'arrayConstrictions']}
              ],
            itemType: [
              {c: '=SwaggerNative', hide: ['objectLink'], show: ['nativeType']},
              {c: '=SwaggerObject', hide: ['nativeType'], show: ['objectLink']}
              ],
            nativeType: [
              {c: '=string', show: ['stringConstrictions']},
              {c: '=number,integer', show: ['numberConstrictions']}
            ]
          }
        ), {customTableActions: this.actions, trIn: v => {
            return v.map((k, i) => {
            k.order = i;
            return k;
          });
        }}
      )
    }
  );


  data;
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
    // this.dataSource = ArrayDataSource.EmptyDS();
    // this.data = {fields: this.dataSource};
    this.data = {fields: [
        {order: 0, fieldName: 'asd', fieldType: 'SwaggerNative', nativeType: 'integer'},
        {order: 1, fieldName: 'zxc', fieldType: 'SwaggerNative', nativeType: 'string'}
      ]};
  }

  onClick(): void {
    this.insertHere.nativeElement.innerHTML = this.textHtml;
    this.innerHtml = this.textHtml;
  }

  onChange(): void {
    this.textHtml = this.knownTexts[this.knownText];
  }

  moveUp(rows: any[]): void {
    console.log('TestDynamicComponent.moveUp');
    if (rows[0].order < 1) {
      return;
    }
    const item = this.data.fields.splice(rows[0].order - 1, 1);
    this.data.fields.splice(rows[rows.length - 1].order, 0, item[0]);
    this.data = {fields: this.data.fields.slice()};
  }
  moveDown(rows: any[]): void {
    console.log('TestDynamicComponent.moveDown');
    if (rows[0].order > this.data.fields.length - 1) {
      return;
    }
    const item = this.data.fields.splice(rows[rows.length - 1].order + 1, 1);
    this.data.fields.splice(rows[0].order, 0, item[0]);
    this.data = {fields: this.data.fields.slice()};
  }

  // change(event: any): void {
  //   console.log('change', this.data, event);
  // }
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
