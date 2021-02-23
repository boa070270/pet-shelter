// I throw here what is changed
import {
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject, mergeCustomUI,
  NumberConstrictions,
  StringConstrictions, SwaggerUI,
  SwaggerSchema
} from '../shared/swagger-object';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';

interface UI extends SwaggerUI {
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

class Waste {
  protected static processNative(swg: SwaggerSchema, required?: boolean): ProcessResult {
    const native = coerceToSwaggerNative(swg);
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
        if (!native.constrictions.enum) {
          result.ui.control = native.constrictions.enum.length <= 4 ? 'radio' : 'select';
          result.ui.options = native.constrictions.enum;
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
    const object = coerceToSwaggerObject(swg);
    if (object) {
      const ui: UI = object.ui || {};
      const controls: { [key: string]: AbstractControl } = {};
      if (object.properties) {
        const uiChildren: { [key: string]: UI } = {};
        for (const [key, value] of Object.entries(object.properties)) {
          const options = Waste.processNative(value, (object.required) ? object.required.includes(key) : false )
            || Waste.processObject(value)
            || Waste.processArray(value);
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
    const arr = coerceToSwaggerArray(swg);
    if (arr) {
      let result = Waste.processNative(arr.items);
      if (result) {
        result.ui = mergeCustomUI(result.ui, arr.ui);
        return result;
      }

      result = Waste.processNative(arr.items);
      if (result) {
        const ui: UI = arr.ui || {};
        ui.children[0] = result.ui;
        return {control: new FormGroup({0: result.control}), ui};
      }
    }
  }


  _ngOnInit(): void {
    // if (this.swagger) {
    //   const result = SwaggerFormComponent.processObject(this.swagger);
    //   this.ui = result.ui;
    //   this.form = result.control as FormGroup;
    // }
  }

}
