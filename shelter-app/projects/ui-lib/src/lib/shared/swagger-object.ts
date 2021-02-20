import {TitleType} from './index';
import {AsyncValidatorFn, FormGroup, ValidatorFn} from '@angular/forms';

export interface CommonConstrictions {
  readOnly?: boolean;
  writeOnly?: boolean; // Maybe will be removed, has not any sense on client-side
  nullable?: boolean; // TODO Make a decision how to use it (maybe always required if true)
  enum?: number[] | string[];
  enumDescriptions?: {[key: string]: string} | TitleType[];
  enumTooltips?: string[] | TitleType[];
  enumMulti?: boolean; // TODO This can be used in case swagger property has type array and simple type as item (with option uniqueItems)
  default?: boolean | number | string;
  format?: 'date' | 'date-time' | 'password' | 'byte' | 'binary' | 'email' | 'uuid' | 'uri' | 'hostname' | 'ipv4' | 'ipv6' | 'file';
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
  toolTip?: string | TitleType[];
  placeHolder?: string | TitleType[];
  validators?: ValidatorFn[];
  asyncValidator?: AsyncValidatorFn[];
  leadingIcon?: string;
  trailingIcon?: string;
  nameAsCaption?: boolean;
}
export function swaggerUI(caption?: string | TitleType[], description?: string | TitleType[],
                          toolTip?: string | TitleType[], placeHolder?: string | TitleType[],
                          leadingIcon?: string, trailingIcon?: string): SwaggerCustomUI {
  return {description, caption, placeHolder, toolTip, leadingIcon, trailingIcon};
}
export type SwaggerNativeTypes = 'string' | 'number' | 'integer' | 'boolean' | 'file';
export function validNativeType(str: string): boolean {
  switch (str) {
    case 'string':
    case 'number':
    case 'integer':
    case 'boolean':
    case 'file':
      return true;
  }
  return false;
}
export abstract class SwaggerSchema {
  // tslint:disable-next-line:variable-name
  protected _ui: SwaggerCustomUI;
  get ui(): SwaggerCustomUI {
    return this._ui;
  }
  protected constructor(ui?: SwaggerCustomUI) {
    this._ui = ui;
  }
  abstract stringify(): string;
}
export abstract class SwaggerNative extends SwaggerSchema {
  get type(): SwaggerNativeTypes {
    return this._type;
  }
  get controlType(): string {
    return this.ctrlType;
  }
  get constrictions(): CommonConstrictions {
    return this.constraints;
  }
  protected constructor(controlType?: string, constraints?: StringConstrictions, ui?: SwaggerCustomUI) {
    super(ui);
    this.constraints = constraints;
    if (controlType) {
      this.ctrlType = controlType;
    } else {
      if (constraints && constraints.enum) {
        this.ctrlType = constraints.enum.length < 4 ? 'radio' : 'select';
      } else {
        this.ctrlType = 'input';
      }
    }
  }
  // tslint:disable-next-line:variable-name
  protected _type: SwaggerNativeTypes;
  protected ctrlType: string;
  protected constraints: CommonConstrictions;
  static asString(controlType?: string, constraints?: StringConstrictions, ui?: SwaggerCustomUI): SwaggerNative {
    return new SwaggerNativeString(controlType, constraints, ui);
  }
  static asNumber(controlType?: string, constraints?: NumberConstrictions, ui?: SwaggerCustomUI): SwaggerNative {
    return new SwaggerNativeNumber(controlType, constraints, ui);
  }
  static asInteger(controlType?: string, constraints?: NumberConstrictions, ui?: SwaggerCustomUI): SwaggerNative {
    return new SwaggerNativeInteger(controlType, constraints, ui);
  }
  static asBoolean(controlType?: string, constraints?: CommonConstrictions, ui?: SwaggerCustomUI): SwaggerNative {
    return new SwaggerNativeBoolean(controlType, constraints, ui);
  }
  static asFile(): SwaggerNative {
    return new SwaggerNativeFile();
  }
  static parse(obj: any): SwaggerNative {
    if (typeof obj === 'object' && obj !== null) {
      const type = obj.type;
      const controlType = obj.controlType;
      const constrictions = obj.constrictions;
      const ui = obj.ui;
      switch (type) {
        case 'string':
          return SwaggerNative.asString(controlType, constrictions, ui);
        case 'number':
          return  SwaggerNative.asNumber(controlType, constrictions, ui);
        case 'integer':
          return SwaggerNative.asInteger(controlType, constrictions, ui);
        case 'boolean':
          return SwaggerNative.asBoolean(controlType, constrictions, ui);
        case 'file':
          return SwaggerNative.asFile();
      }
    }
    return null;
  }
  stringify(): string {
    return `{"type":"${this.type}","controlType":"${this.controlType}","constrictions":"${this.constrictions}","ui":"${this.ui}"`;
  }
  /**
   * we assume that we compare with the same property of a different swagger object of the same class
   * @param p1 any
   * @param p2 any
   */
  abstract compare(p1: any, p2: any): number;
}
export class SwaggerArray extends SwaggerSchema {
  protected items: SwaggerNative | SwaggerObject;
  get itemsType(): SwaggerNative | SwaggerObject {
    return this.items;
  }
  protected constraints: ArrayConstrictions;
  get constrictions(): ArrayConstrictions {
    return this.constraints;
  }
  constructor(items: SwaggerNative | SwaggerObject, constraints?: ArrayConstrictions, ui?: SwaggerCustomUI) {
    super(ui);
    this.items = items;
    this.constraints = constraints;
    this._ui = ui;
  }
  static parse(obj: any): SwaggerArray {
    const itemsType = obj.itemsType;
    if (typeof itemsType === 'object' && itemsType !== null) {
      let items: SwaggerNative | SwaggerObject = SwaggerNative.parse(itemsType);
      if (!items) {
        items = SwaggerObject.parse(itemsType);
      }
      if (items) {
        return new SwaggerArray(items, obj.constrictions, obj.ui);
      }
    }
    return null;
  }
  stringify(): string {
    return `{"itemsType":"${this.itemsType}","constrictions":"${this.constrictions}","ui":"${this.ui}"`;
  }
}
export class SwaggerObject extends SwaggerSchema {
  /**
   * this property allows ordering controls on the edit form
   * after generation from a swagger file need to check this order
   */
  protected orderCtrl: string[];
  get orderControls(): string[] {
    return this.orderCtrl;
  }
  protected props: { [key: string]: SwaggerSchema };
  get properties(): { [key: string]: SwaggerSchema } {
    return this.props;
  }
  /**
   * the same as swagger, properties that are required
   */
  protected needs: string[];
  get required(): string[] {
    return this.needs;
  }
  constructor(orderCtrl: string[], properties: { [key: string]: SwaggerSchema }, ui?: SwaggerCustomUI, required?: string[]) {
    super(ui);
    this.props = properties || {};
    this.orderCtrl = orderCtrl || Object.keys(this.props).filter(() => true);
    this.needs = required || [];
  }
  static parse(schema: any): SwaggerObject {
    let obj = null;
    if (typeof schema === 'string') {
      obj = JSON.parse(schema);
    }
    if (typeof obj === 'object' && obj !== null) {
      const orderControls = Array.isArray(obj.orderControls) ? obj.orderControls : null;
      const ui = obj.ui;
      const required = Array.isArray(obj.required) ? obj.required : null;
      const props = obj.properties;
      const properties = {};
      if (typeof props === 'object' && props !== null) {
        for (const [key, value] of Object.entries(props)) {
          let p: SwaggerSchema = SwaggerNative.parse(value);
          if (!p) {
            p = SwaggerArray.parse(value);
          }
          if (!p) {
            p = SwaggerObject.parse(value);
          }
          if (!p) {
            return null;
          }
          properties[key] = p;
        }
      }
      return new SwaggerObject(orderControls, properties, ui, required);
    }
    return null;
  }
  stringify(): string {
    return `{"orderControls":"${this.orderControls}","required":"${this.required}","ui":"${this.ui}","properties":"${this.stringifyProperties()}"}`;
  }
  private stringifyProperties(): string {
    const res = [];
    for (const [key, value] of Object.entries(this.properties)) {
      res.push(`"${key}":"${value.stringify()}"`);
    }
    return '{' + res.join(',') + '}';
  }
}

export class SwaggerNativeBoolean extends SwaggerNative {
  constructor(controlType?: string, constraints?: CommonConstrictions, ui?: SwaggerCustomUI) {
    super(controlType, constraints, ui);
    this._type = 'boolean';
    if (!controlType) {
      this.ctrlType = 'boolean';
    }
  }
  // assume that false < true
  compare(p1: boolean, p2: boolean): number {
    if (p1 === p2) {
      return 0;
    }
    return p1 ? 1 : -1;
  }
}
export class SwaggerNativeNumber extends SwaggerNative {
  constructor(controlType?: string, constraints?: NumberConstrictions, ui?: SwaggerCustomUI) {
    super(controlType, constraints, ui);
    this._type = 'number';
  }
  compare(p1: number, p2: number): number {
    return p1 - p2;
  }
}
export class SwaggerNativeInteger extends SwaggerNative {
  constructor(controlType?: string, constraints?: NumberConstrictions, ui?: SwaggerCustomUI) {
    super(controlType, constraints, ui);
    this._type = 'integer';
  }
  compare(p1: number, p2: number): number {
    return p1 - p2;
  }
}
export class SwaggerNativeString extends SwaggerNative {
  constructor(controlType?: string, constraints?: StringConstrictions, ui?: SwaggerCustomUI) {
    super(controlType, constraints, ui);
    this._type = 'string';
  }
  compare(p1: string, p2: string): number {
    return p1.localeCompare(p2);
  }
}
export class SwaggerNativeFile extends SwaggerNative {
  constructor() {
    super();
    this._type = 'file';
  }
  compare(p1: File, p2: File): number {
    if (!p1 && p2) {
      return -1;
    } else if (p1 && !p2) {
      return 1;
    }
    return p1.name.localeCompare(p2.name); // TODO
  }
}

export interface SwaggerComponent {
  swagger: SwaggerSchema;
  propertyId: string;
  required?: boolean;
}
export interface SwaggerGroupComponent extends SwaggerComponent {
  formGroup: FormGroup;
}

export function coerceToSwaggerNative(obj: SwaggerSchema): SwaggerNative {
  return (obj instanceof SwaggerNative) ? obj : null;
}
export function coerceToSwaggerArray(obj: SwaggerSchema): SwaggerArray {
  return (obj instanceof SwaggerArray) ? obj : null;
}
export function coerceToSwaggerObject(obj: SwaggerSchema): SwaggerObject {
  return (obj instanceof SwaggerObject) ? obj : null;
}
export function mergeCustomUI(dest: SwaggerCustomUI, source: SwaggerCustomUI): SwaggerCustomUI {
  const ui = dest || {} as SwaggerCustomUI;
  if (source) {
    ui.description = source.description || ui.description;
    ui.caption = source.caption || ui.caption;
    ui.toolTip = source.toolTip || ui.toolTip;
  }
  return ui;
}
