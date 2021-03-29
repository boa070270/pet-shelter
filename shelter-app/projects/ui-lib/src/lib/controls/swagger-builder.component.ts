import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {BaseComponent} from './base.component';
import {ControlValueAccessor} from '@angular/forms';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {EditableListComponent} from './editable-list.component';
import {SwaggerNative, SwaggerObject, SwaggerArray, swaggerUI, TitleType} from '../shared';
import {CheckboxControlComponent, CheckboxParameters} from './checkbox-control.component';
import {SelectControlComponent} from './select-control.component';
import {SwaggerFormComponent} from './swagger-form';

@Component({
  selector: 'lib-swagger-builder',
  templateUrl: './swagger-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class SwaggerBuilderComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  // tslint:disable-next-line:variable-name
  private _extraParams: CheckboxParameters = {};

  availableTypes = ['SwaggerNative', 'SwaggerArray', 'SwaggerObject'];
  checkbox;

  list: string[];
  selected: string;
  selectedType: string;
  arrayType: string;
  nestedOptions: SwaggerObject[];
  formObject: SwaggerObject = this.setFormObject('native');

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
          sex: SwaggerNative.asString(null, {enum: ['m', 'f']})
        })
    }, null, ['id']);

  get props(): object {
    return this.swagger.properties;
  }

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
  set options(p: SwaggerObject[]) {
    this.extraParams.options = p;
  }
  get options(): SwaggerObject[] {
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
  @ViewChild(SwaggerFormComponent) swaggerForm: SwaggerFormComponent;

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
        // TODO save new list items or delete old if changed
        console.log('SwaggerBuilderComponent.EditableList.registerOnChange = Array: ', change);
        return {};
      }
      if (this.selected) {
        switch (this.selectControl.getArrayValues()[0]) {
          case 'SwaggerNative':
            this.props[this.selected] = SwaggerNative.parse(this.swaggerForm.formGroup.value);
            break;
          case 'SwaggerArray':
            this.props[this.selected] = SwaggerArray.parse(this.swaggerForm.formGroup.value);
            break;
          case 'SwaggerObject':
          // TODO
        }
        console.log('SwaggerBuilderComponent.EditableList.registerOnChange.swagger', this.swagger);
      }

      this.selected = change;
      // TODO change selectControl to value corresponding to 'selected'
      if (this.props[this.selected] instanceof SwaggerNative) {
        this.selectControl.setValue('SwaggerNative', true);
        // this.swaggerForm.writeValue()
        // TODO change select inside form to ...
        console.log('SwaggerBuilderComponent.EditableList.registerOnChange.type',
          (this.props[this.selected] as SwaggerNative).type);
        this.swaggerForm.writeValue({type: (this.props[this.selected] as SwaggerNative).type});
      }

      // if (this.swaggerForm) {
      //   this.swaggerForm.registerOnChange(formChange => {
      //     console.log('SwaggerBuilderComponent.swaggerForm.registerOnChange', formChange);
      //     console.log(this.swaggerForm.getFormControl('type'));
      //     return {};
      //   });
      // }
      return {};
    });
    // selectedType.registerOnChange - change inputs
    this.selectControl.registerOnChange(change => {
      console.log('SwaggerBuilderComponent.select.onChange', change);
      // TODO if change !== old type : do something (just to be sure)
      this.selectedType = change;
      switch (change) {
        case 'SwaggerNative':
          this.formObject = this.setFormObject('native');
          break;
        case 'SwaggerArray':
          this.formObject = this.setFormObject('array');
          break;
        case 'SwaggerObject':
          // TODO nested options
          this.nestedOptions = [this.swagger];
          this.formObject = this.setFormObject('null');
          break;
      }
      return {};
    });
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

  setFormObject(type): SwaggerObject {
    const nativeTypes = ['string', 'number', 'integer', 'boolean'];
    switch (type) {
      case 'native':
        return new SwaggerObject(['type'], {
            type: SwaggerNative.asString(null, {enum: nativeTypes},
              swaggerUI([{lang: 'en', title: 'Array type'}, {lang: 'uk', title: 'Тип елементів массиву'}])),
          }
        );
      case 'array':
        return new SwaggerObject(['type'], {
          type: SwaggerNative.asString(null, {enum: nativeTypes},
            swaggerUI([{lang: 'en', title: 'Native type'}, {lang: 'uk', title: 'Тип нативного елементу'}]))
        });
      case 'null':
        return null;
    }
  }

}
