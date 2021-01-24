import {TitleType} from '../shared';
import {AsyncValidatorFn, FormGroup, ValidatorFn} from '@angular/forms';

export interface CommonConstrictions {
  readOnly?: boolean;
  writeOnly?: boolean; // Maybe will be removed, has not any sense on client-side
  nullable?: boolean; // TODO Make a decision how to use it (maybe always required if true)
  enums?: number[] | string[];
  enumDescriptions?: {[key: string]: string} | TitleType[];
  enumMulti?: boolean; // TODO This's used in case swagger property has type array and simple type as item (with option uniqueItems)
  default?: boolean | number | string;
  format?: 'date' | 'date-time' | 'password' | 'byte' | 'binary' | 'email' | 'uuid' | 'uri' | 'hostname' | 'ipv4' | 'ipv6';
}

export interface NumberConstrictions extends CommonConstrictions {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export interface StringConstrictions extends CommonConstrictions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}
export interface ArrayConstrictions {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

/**
 * "description" can be obtained from swagger
 * other properties need handle work
 */
export interface SwaggerCustomUI {
  description?: string | TitleType[]; // this property is used as hint
  caption?: string | TitleType[];
  toolTips?: string | TitleType[];
  placeHolder?: string | TitleType[];
  validators?: ValidatorFn[];
  asyncValidator?: AsyncValidatorFn[];
  leadingIcon?: string;
  trailingIcon?: string;
}
export function swaggerUI(description?: string | TitleType[], caption?: string | TitleType[],
                          toolTips?: string | TitleType[], placeHolder?: string | TitleType[],
                          leadingIcon?: string, trailingIcon?: string): SwaggerCustomUI {
  return {description, caption, placeHolder, toolTips, leadingIcon, trailingIcon};
}
export interface SwaggerNative {
  type: 'string' | 'number' | 'integer' | 'boolean';
  controlType: string;
  constrictions?: NumberConstrictions | StringConstrictions;
  ui?: SwaggerCustomUI;
}

function defaultControlType(type: 'string' | 'number' | 'integer' | 'boolean',
                            constrictions: NumberConstrictions | StringConstrictions): string {
  if (type === 'boolean') {
    return 'boolean';
  }
  if (constrictions && constrictions.enums) {
    return constrictions.enums.length < 4 ? 'checkbox' : 'input';
  }
}

export function swaggerNative(type: 'string' | 'number' | 'integer' | 'boolean', controlType?: string,
                              constrictions?: NumberConstrictions | StringConstrictions, ui?: SwaggerCustomUI): SwaggerNative {
  return {type, constrictions, ui, controlType: controlType || defaultControlType(type, constrictions)};
}
export interface SwaggerArray {
  itemsType: SwaggerNative | SwaggerObject;
  constrictions?: ArrayConstrictions;
  showColumns: string[];
  obtainColumns: (c: string) => string;
  ui?: SwaggerCustomUI;
}
export interface SwaggerObject {
  /**
   * this property allows ordering controls on the edit form
   * after generation from a swagger file need to check this order
   */
  orderControls: Array<string>;
  properties: { [key: string]: SwaggerSchema };
  required?: string[];
  ui?: SwaggerCustomUI;
}

export type SwaggerSchema = SwaggerNative | SwaggerObject | SwaggerArray;

export interface SwaggerComponent {
  swagger: SwaggerSchema;
  propertyId: string;
  required?: boolean;
}
export interface SwaggerGroupComponent extends SwaggerComponent {
  formGroup: FormGroup;
}

export function coerceToSwaggerNative(type: SwaggerSchema): SwaggerNative {
  const t = type as SwaggerNative;
  if (t && t.type) {
    return t;
  }
}
export function coerceToSwaggerArray(type: SwaggerSchema): SwaggerArray {
  const t = type as SwaggerArray;
  if (t && t.itemsType) {
    return t;
  }
}
export function coerceToSwaggerObject(type: SwaggerSchema): SwaggerObject {
  const t = type as SwaggerObject;
  if (t && t.properties) {
    return t;
  }
}
export function mergeCustomUI(dest: SwaggerCustomUI, source: SwaggerCustomUI): SwaggerCustomUI {
  const ui = dest || {} as SwaggerCustomUI;
  if (source) {
    ui.description = source.description || ui.description;
    ui.caption = source.caption || ui.caption;
    ui.toolTips = source.toolTips || ui.toolTips;
  }
  return ui;
}
