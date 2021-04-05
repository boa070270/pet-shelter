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
    ['link', 'constriction', 'objectConstrictions', 'ui', 'fields'],
    {
      // TODO check links for duplicates with pattern constraint?
      link: SwaggerNative.asString(),
      constriction: new SwaggerObject(
        ['control', 'validators', 'asyncValidator'],
        {
          control: SwaggerNative.asString(),
          validators: SwaggerNative.asString(), // TODO use angular Validators
          asyncValidator: SwaggerNative.asString(), // ???
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
      ui: new SwaggerObject(
        ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
        {
          description: SwaggerNative.asString(),
          caption: SwaggerNative.asString(), // ???
          toolTip: SwaggerNative.asString(), // ???
          placeHolder: SwaggerNative.asString(), // ???
          leadingIcon: SwaggerNative.asString(),
          trailingIcon: SwaggerNative.asString(),
          nameAsCaption: SwaggerNative.asBoolean(),
        }
      ),
      // TODO rules
      fields: new SwaggerArray(
        new SwaggerObject(
          ['fieldName', 'fieldType', 'itemType', 'nativeType', 'objectLink', 'required',
            'constriction', 'nativeConstrictions', 'numberConstrictions', 'stringConstrictions',
            'arrayConstrictions', 'ui'],
          {
            order: SwaggerNative.asInteger(null, {default: 0}),
            fieldName: SwaggerNative.asString(),
            fieldType: SwaggerNative.asString(null,
              {enum: ['SwaggerNative', 'SwaggerArray', 'SwaggerObject']}),
            constriction: new SwaggerObject(
              ['control', 'validators', 'asyncValidator'],
              {
                control: SwaggerNative.asString(),
                validators: SwaggerNative.asString(), // TODO use angular Validators
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
                enum: new SwaggerArray(SwaggerNative.asString()),
                enumDescriptions: SwaggerNative.asString(), // ???
                enumTooltips: new SwaggerArray(SwaggerNative.asString()), // ??? write TitleType[] as string and parse later?
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
              ['minLength', 'maxLength', 'pattern'],
              {
                minLength: SwaggerNative.asNumber(),
                maxLength: SwaggerNative.asNumber(),
                pattern: SwaggerNative.asString()
              }
            ),
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
            // TODO cannot set ui for swagger native if setting ui for swagger array
            ui: new SwaggerObject(
              ['description', 'caption', 'toolTip', 'placeHolder', 'leadingIcon', 'trailingIcon', 'nameAsCaption'],
              {
                description: SwaggerNative.asString(),
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
              {c: '!SwaggerNative,SwaggerObject,SwaggerArray',
                hide: ['itemType', 'nativeType', 'objectLink', 'nativeConstrictions',
                  'arrayConstrictions', 'stringConstrictions', 'numberConstrictions']},
              {c: '=SwaggerNative',
                hide: ['itemType', 'objectLink', 'arrayConstrictions'],
                show: ['nativeType', 'nativeConstrictions']},
              {c: '=SwaggerObject',
                hide: ['itemType', 'nativeType', 'nativeConstrictions',
                  'arrayConstrictions', 'stringConstrictions', 'numberConstrictions'],
                show: ['objectLink']
              },
              {c: '=SwaggerArray',
                hide: ['nativeConstrictions', 'stringConstrictions', 'numberConstrictions'],
                show: ['itemType', 'arrayConstrictions']}
            ],
            itemType: [
              {c: '=SwaggerNative', hide: ['objectLink'], show: ['nativeType', 'nativeConstrictions']},
              {c: '=SwaggerObject', hide: ['nativeType', 'nativeConstrictions', 'stringConstrictions',
                  'numberConstrictions'], show: ['objectLink']}
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
    console.log(this.objectLink.list);
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
}
