import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {BaseComponent} from './base.component';
import {ControlValueAccessor} from '@angular/forms';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {EditableListComponent} from './editable-list.component';
import {SwaggerNative, SwaggerObject, SwaggerSchema, SwaggerUI, swaggerUI, TitleType} from '../shared';
import {CheckboxControlComponent, CheckboxParameters} from './checkbox-control.component';
import {SelectControlComponent} from './select-control.component';
import {SwaggerFormComponent} from './swagger-form';

interface SwaggerObjectConstruct {
  orderControls: string[];
  properties: { [key: string]: SwaggerSchema };
  ui: SwaggerUI;
  required: string[];
}

@Component({
  selector: 'lib-swagger-builder',
  templateUrl: './swagger-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class SwaggerBuilderComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  // tslint:disable-next-line:variable-name
  private _extraParams: CheckboxParameters = {};

  availableTypes = ['SwaggerNative', 'SwaggerArray', 'SwaggerObject'];
  nativeTypes = ['string', 'number', 'integer', 'boolean'];
  checkbox;

  list: string[];
  selected: string;
  selectedType: string;
  arrayType: string;
  nestedOptions: SwaggerObjectConstruct[];
  swaggerObject: SwaggerObject;
  swagger: SwaggerObjectConstruct = {
    orderControls: ['id', 'description', 'child'],
    properties: {
      id: SwaggerNative.asString(),
      description: SwaggerNative.asString(),
      child: new SwaggerObject(
        ['childId', 'childDescription', 'sex'],
        {
          childId: SwaggerNative.asString(),
          childDescription: SwaggerNative.asString(),
          sex: SwaggerNative.asString(null, {enum: ['m', 'f']})
        })
    },
    ui: null,
    required: ['id']
  };

  @Input()
  set extraParams(p: CheckboxParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): CheckboxParameters {
    if (!this._extraParams) {
      this._extraParams = {};
    }
    return this._extraParams;
  }
  @Input()
  set options(p: SwaggerObjectConstruct[]) {
    this.extraParams.options = p;
  }
  get options(): SwaggerObjectConstruct[] {
    if (!this.extraParams.options) {
      this.extraParams.options = [{orderControls: null, properties: null, ui: null, required: null}];
    }
    return this.extraParams.options;
  }
  @Input()
  set titles(p: {[key: string]: string} | TitleType[]) {
    this.extraParams.titles = p;
  }
  get titles(): {[key: string]: string} | TitleType[] {
    return this.extraParams.titles || null;
  }
  @Input()
  set tooltips(p: string[] | TitleType[]) {
    this.extraParams.tooltips = p;
  }
  get tooltips(): string[] | TitleType[] {
    return this.extraParams.tooltips || null;
  }

  @ViewChild(EditableListComponent, {static: true}) result: EditableListComponent;
  @ViewChild(SelectControlComponent, {static: true}) selectControl: SelectControlComponent;
  @ViewChild(CheckboxControlComponent, {static: true}) isRequired: CheckboxControlComponent;
  @ViewChild(SwaggerFormComponent, {static: true}) swaggerForm: SwaggerFormComponent;

  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.buttonTitles();
    this.swagger = (this.options)[0];

    this.list = Object.keys(this.swagger.properties);
    this.result.setDisabledState(this.disabled);

    this.result.registerOnChange(change => {
      if (change instanceof Array) {
        console.log('SwaggerBuilderComponent.EditableList.registerOnChange = Array');
        return {};
      }
      this.selected = change;
      // if is in options swagger - get value and put here
      // this.selectControl.clearAll();
      // this.selectControl.setValue('SwaggerObject', true);
      // this.isRequired.setValue('required', true);
      return {};
    });
    // selectedType.registerOnChange - change inputs
    this.selectControl.registerOnChange(change => {
      console.log('SwaggerBuilderComponent.select.onChange', change);
      this.selectedType = change;
      switch (change) {
        case 'SwaggerNative':
          this.swaggerObject = new SwaggerObject([], {
              type: SwaggerNative.asString(null, {enum: this.nativeTypes},
                swaggerUI([{lang: 'en', title: 'Native type'}, {lang: 'uk', title: 'Тип нативного елементу'}]))
            }
          );
          break;
        case 'SwaggerArray':
          this.swaggerObject = new SwaggerObject([], {
              arrayType: SwaggerNative.asString(null, {enum: this.nativeTypes},
                swaggerUI([{lang: 'en', title: 'Array type'}, {lang: 'uk', title: 'Тип елементів массиву'}])),
            }
          );
          break;
        case 'SwaggerObject':
          this.swaggerObject = null;
          break;
      }
      return {};
    });
    this.swaggerForm.registerOnChange(change => {
      console.log('SwaggerBuilderComponent.swaggerForm.registerOnChange', change);
      return {};
    });
    // Native:               Select type (string, number...) (for now)
    // obj.type, obj.controlType, obj.constrictions, obj.ui
    // Array:                Select type (native/object) - inside swagger builder for selected
    // obj.itemsType, obj.constrictions, obj.ui
    // Object:                       Swagger Builder Component
    // obj.orderControls, obj.ui, obj.required, obj.properties
  }

  onChangeLang(): void {
    super.onChangeLang();
    this.buttonTitles();
  }
  buttonTitles(): void {
    // this.titleAdd = this.systemLang.getTitle(DEF_ADD_TITLES);

  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
