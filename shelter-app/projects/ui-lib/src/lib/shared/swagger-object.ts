import {TitleType} from './language';

export interface CommonConstrictions {
  readOnly?: boolean;
  writeOnly?: boolean;
  nullable?: boolean;
  enums?: number[] | string[];
  enumDescriptions: string[];
  default: boolean | number | string;
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
  format?: 'date' | 'date-time' | 'password' | 'byte' | 'binary' | 'email' | 'uuid' | 'uri' | 'hostname' | 'ipv4' | 'ipv6';
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
  description?: string; // this property is used as hint
  title?: string | TitleType[];
  toolTypes?: string | TitleType[];
}
export interface SwaggerNative {
  type: 'string' | 'number' | 'integer' | 'boolean';
  constrictions?: NumberConstrictions | StringConstrictions;
  ui?: SwaggerCustomUI;
}
export interface SwaggerArray {
  itemsType: SwaggerNative | SwaggerObject;
  constrictions?: ArrayConstrictions;
  showColumns: string[];
  obtainColumns: (c: string) => string;
  ui?: SwaggerCustomUI;
}
export interface SwaggerObject {
  required?: string[];
  properties: { [key: string]: SwaggerSchema };
  ui?: SwaggerCustomUI;
  /**
   * this property allows ordering controls on the edit form
   * after generation from a swagger file need to check this order
   */
  orderControls?: Array<string>;
}
export type SwaggerSchema = SwaggerNative | SwaggerObject | SwaggerArray;

export function coerceToNative(type: SwaggerSchema): SwaggerNative {
  const t = type as SwaggerNative;
  if (t && t.type) {
    return t;
  }
}
export function coerceToArray(type: SwaggerSchema): SwaggerArray {
  const t = type as SwaggerArray;
  if (t && t.itemsType) {
    return t;
  }
}
export function coerceToObject(type: SwaggerSchema): SwaggerObject {
  const t = type as SwaggerObject;
  if (t && t.properties) {
    return t;
  }
}
export function mergeCustomUI(dest: SwaggerCustomUI, source: SwaggerCustomUI): SwaggerCustomUI {
  const ui = dest || {};
  if (source) {
    ui.description = source.description || ui.description;
    ui.title = source.title || ui.title;
    ui.toolTypes = source.toolTypes || ui.toolTypes;
  }
  return ui;
}
