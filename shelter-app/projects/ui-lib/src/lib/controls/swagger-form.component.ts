import {Component, Input, OnInit} from '@angular/core';
import {
  coerceToArray,
  coerceToNative,
  coerceToObject,
  SwaggerCustomUI,
  mergeCustomUI,
  NumberConstrictions,
  StringConstrictions,
  SwaggerSchema,
  SwaggerObject
} from '../shared';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SystemLang} from '../i18n';

interface UI extends SwaggerCustomUI {
  disabled?: boolean;
  control?: string;
  controlType?: string;
  controlDefault?: any; // default value
  options?: number[] | string[];
  optionDescriptions?: string[]; // for checkbox || select || radio - the property is titles[]
  children?: { [key: string]: UI };
}

interface ProcessResult {
  control?: AbstractControl;
  ui?: UI;
}

@Component({
  selector: 'lib-swagger-form',
  templateUrl: './swagger-form.component.html',
  styleUrls: ['./swagger-form.component.scss']
})
export class SwaggerFormComponent implements OnInit {
  @Input() data: any;
  @Input() swagger: SwaggerObject;
  form: FormGroup;
  ui: UI;

  protected static processNative(swg: SwaggerSchema, required?: boolean): ProcessResult {
    const native = coerceToNative(swg);
    if (native) {
      const result: ProcessResult = {};
      const validators = [];
      result.ui = native.ui || {};
      let needRequired = required;
      if (native.constrictions) {
        needRequired = !native.constrictions.nullable;
        if (!native.constrictions.readOnly) {
          result.ui.disabled = true;
        }
        if (!native.constrictions.enums) {
          result.ui.control = native.constrictions.enums.length <= 4 ? 'radio' : 'select';
          result.ui.options = native.constrictions.enums;
        }
        result.ui.controlDefault = native.constrictions.default || null;
      }
      if (!result.ui.control) {
        if (native.type === 'boolean') {
          result.ui.control = 'boolean';
          result.ui.disabled = true;
        } else if (native.type === 'string') {
          const constriction = native.constrictions as StringConstrictions;
          result.ui.control = 'string';
          result.ui.controlType = constriction.format;
          if (constriction.minLength > 0) {
            validators.push(Validators.minLength(constriction.minLength));
          }
          if (constriction.maxLength > 0) {
            validators.push(Validators.maxLength(constriction.maxLength));
          }
          if (constriction.pattern) {
            validators.push(Validators.pattern(constriction.pattern));
          }
          if (constriction.format === 'email') {
            validators.push(Validators.email);
          }
        } else if (native.type === 'number' || native.type === 'integer') {
          const constriction = native.constrictions as NumberConstrictions;
          result.ui.control = 'string';
          result.ui.controlType = 'number';
          if (typeof constriction.exclusiveMaximum === 'number') {
            validators.push(Validators.max(constriction.exclusiveMaximum));
          }
          if (typeof constriction.exclusiveMinimum === 'number') {
            validators.push(Validators.min(constriction.exclusiveMinimum));
          }
          if (typeof constriction.maximum === 'number') {
            validators.push(Validators.max(constriction.maximum));
          }
          if (typeof constriction.minimum === 'number') {
            validators.push(Validators.min(constriction.minimum));
          }
        }
      }
      if (needRequired) {
        validators.push(Validators.required);
      }
      const value = result.ui.controlDefault;
      if (result.ui.disabled !== undefined) {
        result.control = new FormControl({value, disabled: result.ui.disabled}, validators);
      }
      result.control = new FormControl(value, validators);
      return result;
    }
  }

  protected static processObject(swg: SwaggerSchema): ProcessResult {
    const object = coerceToObject(swg);
    if (object) {
      const ui: UI = object.ui || {};
      const controls: { [key: string]: AbstractControl } = {};
      if (object.properties) {
        const uiChildren: { [key: string]: UI } = {};
        for (const [key, value] of Object.entries(object.properties)) {
          const options = SwaggerFormComponent.processNative(value, (object.required) ? object.required.includes(key) : false )
            || SwaggerFormComponent.processObject(value)
            || SwaggerFormComponent.processArray(value);
          if (!options) {
            console.log('cannot process property:', key);
            continue;
          }
          controls[key] = options.control;
          uiChildren[key] = options.ui;
        }
        ui.children = uiChildren;
      }
      return {control: new FormGroup(controls), ui};
    }
  }
  protected static processArray(swg: SwaggerSchema): ProcessResult {
    const arr = coerceToArray(swg);
    if (arr) {
      let result = SwaggerFormComponent.processNative(arr.itemsType);
      if (result) {
        result.ui = mergeCustomUI(result.ui, arr.ui);
        return result;
      }

      result = SwaggerFormComponent.processNative(arr.itemsType);
      if (result) {
        const ui: UI = arr.ui || {};
        ui.children[0] = result.ui;
        return {control: new FormGroup({0: result.control}), ui};
      }
    }
  }

  constructor(public systemLang: SystemLang) {
  }

  ngOnInit(): void {
    if (this.swagger) {
      const result = SwaggerFormComponent.processObject(this.swagger);
      this.ui = result.ui;
      this.form = result.control as FormGroup;
    }
  }
}
