import {AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {BaseComponent} from './base.component';
import {ControlValueAccessor} from '@angular/forms';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {
  SwaggerNative,
  SwaggerObject,
  SwaggerArray,
  swaggerUI,
  TitleType,
} from '../shared';
import {ObjectLinkService} from './object-link.service';
import {SwaggerFormComponent} from './swagger-form';

@Component({
  selector: 'lib-swagger-builder',
  templateUrl: './swagger-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class SwaggerBuilderComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  @Input()
  swagger: SwaggerObject;

  i18n = {
    act_up: [{lang: 'en', title: 'Move one position up'}, {lang: 'uk', title: 'Підняти на одну позицію'}],
    act_down: [{lang: 'en', title: 'Move one position down'}, {lang: 'uk', title: 'Опустити на одну позицію'}]
  };
  actions: Array<{icon: string, tooltip: string | TitleType[], command: string, action: (v) => void}> = [
    {icon: 'gm-keyboard_arrow_up', command: 'move-up', tooltip: this.i18n.act_up, action: (v) => { this.moveUp(v); }},
    {icon: 'gm-keyboard_arrow_down', command: 'move-down', tooltip: this.i18n.act_down, action: (v) => { this.moveDown(v); }}
  ];
  formSwagger: SwaggerObject = new SwaggerObject(
    ['link', 'isConstriction', 'constriction', 'isObjectConstrictions', 'objectConstrictions', 'isUi', 'ui', 'fields'],
    {
      // TODO check links for duplicates with pattern constraint?
      link: SwaggerNative.asString(),
      isConstriction: SwaggerNative.asBoolean(null, null,
        swaggerUI([{lang: 'en', title: 'Add base constrictions?'}, {lang: 'uk', title: 'Додати базові обмеження?'}])),
      constriction: new SwaggerObject(
        ['control', 'validators', 'asyncValidator'],
        {
          control: SwaggerNative.asString(),
          validators: SwaggerNative.asString(), // TODO use angular Validators
          asyncValidator: SwaggerNative.asString(), // ???
        }
      ),
      isObjectConstrictions: SwaggerNative.asBoolean(null, null,
        swaggerUI([{lang: 'en', title: 'Add object constrictions?'}, {lang: 'uk', title: 'Додати обмеження об\'єкту?'}])),
      objectConstrictions: new SwaggerObject(
        ['orderCtrl', 'toFrm', 'fromFrm'],
        {
          orderCtrl: new SwaggerArray(SwaggerNative.asString()),
          toFrm: SwaggerNative.asString(), // ???
          fromFrm: SwaggerNative.asString() // ???
        }
      ),
      isUi: SwaggerNative.asBoolean(null, null,
        swaggerUI([{lang: 'en', title: 'Add UI?'}, {lang: 'uk', title: 'Додати UI?'}])),
      ui: new SwaggerObject(
        ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
        {
          description: this.stringOrArrayTitle('description'),
          caption: this.stringOrArrayTitle('caption'),
          toolTip: this.stringOrArrayTitle('toolTip'),
          placeHolder: this.stringOrArrayTitle('placeHolder'),
          leadingIcon: SwaggerNative.asString(),
          trailingIcon: SwaggerNative.asString(),
          nameAsCaption: SwaggerNative.asBoolean(),
        }
      ),
      // TODO rules
      fields: new SwaggerArray(
        new SwaggerObject(
          ['fieldName', 'fieldType', 'itemType', 'nativeType', 'objectLink', 'required',
            'isConstriction', 'constriction', 'isNativeConstrictions', 'nativeConstrictions',
            'isNumberConstrictions', 'numberConstrictions', 'isStringConstrictions', 'stringConstrictions',
            'isArrayConstrictions', 'arrayConstrictions', 'isConstrictionNative', 'constrictionNative',
            'isUi', 'ui', 'uiNative', 'uiNative'],
          {
            order: SwaggerNative.asInteger(null, {default: 0}),
            fieldName: SwaggerNative.asString(),
            fieldType: SwaggerNative.asString(null,
              {enum: ['SwaggerNative', 'SwaggerArray', 'SwaggerObject']}),
            isConstriction: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add base constrictions?'}, {lang: 'uk', title: 'Додати базові обмеження?'}])),
            constriction: new SwaggerObject(
              ['control', 'validators', 'asyncValidator'],
              {
                control: SwaggerNative.asString(),
                validators: SwaggerNative.asString(), // TODO use angular Validators
                asyncValidator: SwaggerNative.asString(), // ???
              }
            ),
            isNativeConstrictions: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add native constrictions?'}, {lang: 'uk', title: 'Додати нативні обмеження?'}])),
            nativeConstrictions: new SwaggerObject(
              ['readOnly', 'immutable', 'writeOnly', 'nullable', 'enum',
                'enumDescriptions', 'enumTooltips', 'enumMulti', 'default', 'format'],
              {
                readOnly: SwaggerNative.asBoolean(),
                immutable: SwaggerNative.asBoolean(),
                writeOnly: SwaggerNative.asBoolean(),
                nullable: SwaggerNative.asBoolean(),
                enum: new SwaggerArray(SwaggerNative.asString()),
                enumDescriptions: new SwaggerObject(
                  ['enumDescriptionsType', 'keyDescriptions', 'titleTypeDescriptions'],
                  {
                    enumDescriptionsType: SwaggerNative.asString('select',
                      {enum: ['key-value', 'TitleType']}),
                    keyDescriptions: new SwaggerArray(new SwaggerObject(
                      ['key', 'value'],
                      {
                        key: SwaggerNative.asString(),
                        value: SwaggerNative.asString()
                      }
                    ), {control: 'editable-list'}),
                    titleTypeDescriptions: new SwaggerArray(new SwaggerObject(
                      ['id', 'lang', 'title'],
                      {
                        id: SwaggerNative.asString(),
                        lang: SwaggerNative.asString(),
                        title: SwaggerNative.asString()
                      },
                      null, ['lang', 'title']
                    ), {control: 'editable-list'})
                  }, null, null, null,
                  { enumDescriptionsType: [
                      {c: ',!key-value,TitleType', hide: ['key-value', 'titleTypeArray']},
                      {c: '=key-value', hide: ['titleTypeArray'], show: ['key-value']},
                      {c: '=TitleType', hide: ['key-value'], show: ['titleTypeArray']}
                    ]
                  }
                ),
                enumTooltips: new SwaggerObject(
                  ['enumTooltipsType', 'stringArray', 'titleTypeArray'],
                  {
                    enumTooltipsType: SwaggerNative.asString('select',
                      {enum: ['string', 'TitleType']}),
                    stringArray: new SwaggerArray(SwaggerNative.asString()),
                    titleTypeArray: new SwaggerArray(new SwaggerObject(
                      ['id', 'lang', 'title'],
                      {
                        id: SwaggerNative.asString(),
                        lang: SwaggerNative.asString(),
                        title: SwaggerNative.asString()
                      },
                      null, ['lang', 'title']
                    ), {control: 'editable-list'})
                  }, null, null, null,
                  { enumTooltipsType: [
                      {c: ',!string,TitleType', hide: ['stringArray', 'titleTypeArray']},
                      {c: '=string', hide: ['titleTypeArray'], show: ['stringArray']},
                      {c: '=TitleType', hide: ['stringArray'], show: ['titleTypeArray']}
                    ]
                  }
                ),
                enumMulti: SwaggerNative.asBoolean(),
                default: SwaggerNative.asString(),
                format: SwaggerNative.asString(null,
                  {enum: ['date', 'date-time', 'password', 'byte', 'binary', 'email', 'uuid', 'uri', 'hostname',
                      'ipv4', 'ipv6', 'color', 'datetime-local', 'month', 'number', 'search', 'tel', 'text', 'time', 'week']}),
              }
            ),
            isNumberConstrictions: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add number constrictions?'}, {lang: 'uk', title: 'Додати числові обмеження?'}])),
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
            isStringConstrictions: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add string constrictions?'}, {lang: 'uk', title: 'Додати обмеження строки?'}])),
            stringConstrictions: new SwaggerObject(
              ['minLength', 'maxLength', 'pattern'],
              {
                minLength: SwaggerNative.asNumber(),
                maxLength: SwaggerNative.asNumber(),
                pattern: SwaggerNative.asString()
              }
            ),
            isArrayConstrictions: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add array constrictions?'}, {lang: 'uk', title: 'Додати обмеження массиву?'}])),
            arrayConstrictions: new SwaggerObject(
              ['minItems', 'maxItems', 'uniqueItems', 'customTableActions', 'trIn', 'trOut'],
              {
                minItems: SwaggerNative.asNumber(),
                maxItems: SwaggerNative.asNumber(),
                uniqueItems: SwaggerNative.asBoolean(),
                customTableActions: SwaggerNative.asString(), // TODO
                trIn: SwaggerNative.asString(),
                trOut: SwaggerNative.asString()
              }
            ),
            itemType: SwaggerNative.asString(null, {enum: ['SwaggerNative', 'SwaggerObject']}),
            nativeType: SwaggerNative.asString(null,
              {enum: ['string', 'number', 'integer', 'boolean']}),
            objectLink: SwaggerNative.asString('select', {enum: this.objectLink.array}),
            isUi: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add UI?'}, {lang: 'uk', title: 'Додати UI?'}])),
            ui: new SwaggerObject(
              ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
              {
                description: this.stringOrArrayTitle('description'),
                caption: this.stringOrArrayTitle('caption'),
                toolTip: this.stringOrArrayTitle('toolTip'),
                placeHolder: this.stringOrArrayTitle('placeHolder'),
                leadingIcon: SwaggerNative.asString(),
                trailingIcon: SwaggerNative.asString(),
                nameAsCaption: SwaggerNative.asBoolean(),
              }
            ),
            isConstrictionNative: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add constrictions for native?'},
                {lang: 'uk', title: 'Додати обмеження для нативного елементу?'}])),
            constrictionNative: new SwaggerObject(
              ['control', 'validators', 'asyncValidator'],
              {
                control: SwaggerNative.asString(),
                validators: SwaggerNative.asString(), // TODO use angular Validators
                asyncValidator: SwaggerNative.asString(), // ???
              }, swaggerUI([{lang: 'en', title: 'Native constrictions'}])
            ),
            isUiNative: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Add UI for native?'},
                {lang: 'uk', title: 'Додати UI для нативного елементу??'}])),
            uiNative: new SwaggerObject(
              ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
              {
                description: this.stringOrArrayTitle('description'),
                caption: this.stringOrArrayTitle('caption'),
                toolTip: this.stringOrArrayTitle('toolTip'),
                placeHolder: this.stringOrArrayTitle('placeHolder'),
                leadingIcon: SwaggerNative.asString(),
                trailingIcon: SwaggerNative.asString(),
                nameAsCaption: SwaggerNative.asBoolean(),
              }, swaggerUI([{lang: 'en', title: 'Native ui'}, {lang: 'uk', title: 'Нативний інтерфейс'}])
            ),
            required: SwaggerNative.asBoolean(null, null,
              swaggerUI([{lang: 'en', title: 'Required'}, {lang: 'uk', title: 'Обов\'язкове поле'}])),
          }, swaggerUI([{lang: 'en', title: 'Object\'s parameters'}, {lang: 'uk', title: 'Параметри об\'єкту'}]),
          ['fieldName', 'fieldType'], null,
          {
            fieldType: [
              {c: ',!SwaggerNative,SwaggerObject,SwaggerArray',
                hide: ['itemType', 'nativeType', 'objectLink', 'isNativeConstrictions',
                  'isArrayConstrictions', 'isStringConstrictions', 'isNumberConstrictions',
                  'isConstrictionNative', 'isUiNative']},
              {c: '=SwaggerNative',
                hide: ['itemType', 'objectLink', 'isArrayConstrictions', 'isConstrictionNative', 'isUiNative'],
                show: ['nativeType', 'isNativeConstrictions']},
              {c: '=SwaggerObject',
                hide: ['itemType', 'nativeType', 'isNativeConstrictions', 'isConstrictionNative', 'isUiNative',
                  'isArrayConstrictions', 'isStringConstrictions', 'isNumberConstrictions'],
                show: ['objectLink']
              },
              {c: '=SwaggerArray',
                hide: ['isNativeConstrictions', 'isStringConstrictions', 'isNumberConstrictions'],
                show: ['itemType', 'isArrayConstrictions']}
            ],
            itemType: [
              {c: '=SwaggerNative', hide: ['objectLink'],
                show: ['nativeType', 'isNativeConstrictions', 'isConstrictionNative', 'isUiNative']},
              {c: '=SwaggerObject', hide: ['nativeType', 'isNativeConstrictions', 'isStringConstrictions',
                  'isNumberConstrictions', 'isConstrictionNative', 'isUiNative'], show: ['objectLink']}
            ],
            nativeType: [
              {c: '=string', show: ['isStringConstrictions']},
              {c: ',=number,integer', show: ['isNumberConstrictions']}
            ],
            isConstriction: [
              {c: ',!true,false', hide: ['constriction']},
              {c: '=true', show: ['constriction']},
              {c: '=false', hide: ['constriction']}
            ],
            isNativeConstrictions: [
              {c: ',!true,false', hide: ['nativeConstrictions']},
              {c: '=true', show: ['nativeConstrictions']},
              {c: '=false', hide: ['nativeConstrictions']}
            ],
            isArrayConstrictions: [
              {c: ',!true,false', hide: ['arrayConstrictions']},
              {c: '=true', show: ['arrayConstrictions']},
              {c: '=false', hide: ['arrayConstrictions']}
            ],
            isStringConstrictions: [
              {c: ',!true,false', hide: ['stringConstrictions']},
              {c: '=true', show: ['stringConstrictions']},
              {c: '=false', hide: ['stringConstrictions']}
            ],
            isNumberConstrictions: [
              {c: ',!true,false', hide: ['numberConstrictions']},
              {c: '=true', show: ['numberConstrictions']},
              {c: '=false', hide: ['numberConstrictions']}
            ],
            isUi: [
              {c: ',!true,false', hide: ['ui']},
              {c: '=true', show: ['ui']},
              {c: '=false', hide: ['ui']}
            ],
            isConstrictionNative: [
              {c: ',!true,false', hide: ['constrictionNative']},
              {c: '=true', show: ['constrictionNative']},
              {c: '=false', hide: ['constrictionNative']}
            ],
            isUiNative: [
              {c: ',!true,false', hide: ['uiNative']},
              {c: '=true', show: ['uiNative']},
              {c: '=false', hide: ['uiNative']}
            ]
          }
        ), {
          displayColumns: ['fieldName', 'fieldType', 'itemType', 'nativeType', 'objectLink', 'required'],
          customTableActions: this.actions, trIn: v => {
            return v.map((k, i) => {
              k.order = i;
              return k;
            });
          }}
      )
    }, null, null, null, {
      isConstriction: [
        {c: ',!true,false', hide: ['constriction']},
        {c: '=true', show: ['constriction']},
        {c: '=false', hide: ['constriction']}
      ],
      isObjectConstrictions: [
        {c: ',!true,false', hide: ['objectConstrictions']},
        {c: '=true', show: ['objectConstrictions']},
        {c: '=false', hide: ['objectConstrictions']}
      ],
      isUi: [
        {c: ',!true,false', hide: ['ui']},
        {c: '=true', show: ['ui']},
        {c: '=false', hide: ['ui']}
      ]
    }
  );
  data;
  @ViewChild(SwaggerFormComponent) formComponent: SwaggerFormComponent;

  get props(): object {
    return this.swagger.properties;
  }

  constructor(public systemLang: SystemLang, protected directionality: Directionality, public objectLink: ObjectLinkService) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.data = {link: '', fields: this.objectLink.toFrm(this.swagger)};
  }

  onChangeLang(): void {
    super.onChangeLang();
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  moveUp(rows: any[]): void {
    console.log('TestDynamicComponent.moveUp', rows);
    if (rows[0].order < 1) {
      return;
    }
    const item = this.data.fields.splice(rows[0].order - 1, 1);
    this.data.fields.splice(rows[rows.length - 1].order, 0, item[0]);
    this.data = {fields: this.data.fields.slice()};
  }
  moveDown(rows: any[]): void {
    console.log('TestDynamicComponent.moveDown', rows);
    if (rows[0].order > this.data.fields.length - 1) {
      return;
    }
    const item = this.data.fields.splice(rows[rows.length - 1].order + 1, 1);
    this.data.fields.splice(rows[0].order, 0, item[0]);
    this.data = {fields: this.data.fields.slice()};
  }

  save(): void {
    const v = this.formComponent.formGroup.value;
    console.log('SwaggerBuilderComponent.save', v);
    // TODO fix formGroup.value being only one property instead of array
    v.fields = this.data.fields;
    this.objectLink.addLink(this.objectLink.fromFrm(v), v.link);
    // temporary solution
    this.load(v.link);
  }
  load(link: string): void {
    const obj = this.objectLink.getObject(link);
    if (obj) {
      this.data = {
        link,
        constriction: obj.constrictions,
        objectConstrictions: (obj as SwaggerObject).constrictions,
        ui: obj.ui,
        fields: this.objectLink.toFrm(obj)
      };
    } else {
      console.log('Broken link: couldn\'t find an object by this link');
    }
  }

  stringOrArrayTitle(property: string): SwaggerObject {
    const str = property + 'String';
    const tt = property + 'TitleType';
    const properties: {[key: string]: any} = {};
    properties[property] = SwaggerNative.asString('select', {enum: ['string', 'TitleType']});
    properties[str] = SwaggerNative.asString();
    properties[tt] = new SwaggerArray(new SwaggerObject(
      ['id', 'lang', 'title'],
      {
        id: SwaggerNative.asString(),
        lang: SwaggerNative.asString(),
        title: SwaggerNative.asString()
      },
      null, ['lang', 'title']
    ), {control: 'editable-list'});

    const rules = {};
    rules[property] = [
        {c: ',!string,TitleType', hide: [str, tt]},
        {c: '=string', hide: [tt], show: [str]},
        {c: '=TitleType', hide: [str], show: [tt]}
      ];
    return new SwaggerObject([property, str, tt], properties, null, null, null, rules);
  }
}
