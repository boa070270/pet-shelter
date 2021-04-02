import { Injectable } from '@angular/core';
import {
  ArrayConstrictions,
  BaseConstrictions,
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject,
  NativeConstrictions,
  NumberConstrictions,
  ObjectConstrictions,
  StringConstrictions,
  SwaggerArray,
  SwaggerNative,
  SwaggerNativeTypes,
  SwaggerObject,
  SwaggerSchema, SwaggerUI
} from '../shared';

@Injectable({
  providedIn: 'root'
})
export class ObjectLinkService {

  list = new Map<string, SwaggerObject>();
  get array(): string[] {
    return [...this.list.keys()];
  }

  constructor() { }

  toFrm(obj: SwaggerObject): PropertyForm[] {
    const props: PropertyForm[] = [];
    for (const property of obj.orderControls) {
      const prop = obj.properties[property];
      const p: PropertyForm = {
        order: obj.orderControls.indexOf(property),
        fieldName: property,
        fieldType: undefined,
        required: obj.required.includes(property),
        constriction: prop.constrictions,
        ui: prop.ui
      };
      if (coerceToSwaggerNative(prop)) {
        p.fieldType = 'SwaggerNative';
        p.nativeType = (prop as SwaggerNative).type;
        p.nativeConstrictions = (prop as SwaggerNative).constrictions;
      } else if (coerceToSwaggerObject(prop)) {
        p.fieldType = 'SwaggerObject';
        p.objectLink = this.getLink(prop as SwaggerObject);
        // p.objectConstrictions = (prop as SwaggerObject).constrictions; ???
      } else if (coerceToSwaggerArray(prop)) {
        p.fieldType = 'SwaggerArray';
        p.arrayConstrictions = (prop as SwaggerArray).constrictions;
        const item = (prop as SwaggerArray).items;
        if (coerceToSwaggerNative(item)) {
          p.itemType = 'SwaggerNative';
          p.nativeType = (item as SwaggerNative).type;
          p.nativeConstrictions = (prop as SwaggerNative).constrictions;
        } else if (coerceToSwaggerObject(item)) {
          p.itemType = 'SwaggerObject';
          p.objectLink = this.getLink(item as SwaggerObject);
        }
      }
      props.push(p);
    }
    return props;
  }

  fromFrm(data: {constriction, objectConstrictions, ui, fields: PropertyForm[]}): SwaggerObject {
    const orderCtrl = [];
    const required = [];
    const props = data.fields;
    const properties: { [key: string]: SwaggerSchema } = {};
    for (const p of props) {
      orderCtrl.push(p.fieldName);
      if (p.required) {
        required.push(p.fieldName);
      }
      switch (p.fieldType) {
        case 'SwaggerArray':
          if (p.itemType === 'SwaggerNative') {
            properties[p.fieldName] = this.setNativeProp(p, true);
          } else if (p.itemType === 'SwaggerObject') {
            properties[p.fieldName] = new SwaggerArray(this.getObject(p.objectLink),
              {...p.nativeConstrictions, ...p.arrayConstrictions}, p.ui
            );
          }
          break;
        case 'SwaggerNative':
          properties[p.fieldName] = this.setNativeProp(p);
          break;
        case 'SwaggerObject':
          properties[p.fieldName] = this.getObject(p.objectLink);
          break;
      }
    }
    return new SwaggerObject(orderCtrl, properties, data.ui, required, data.constriction);
  }
  setNativeProp(p, wrap?): SwaggerNative | SwaggerArray {
    let c;
    if (wrap) {
      c = [null, {...p.nativeConstrictions, ...p.numberConstrictions, ...p.stringConstrictions}, null];
      wrap = [{...p.constriction, ...p.arrayConstrictions}, p.ui];
    } else {
      c = {...p.constriction, ...p.nativeConstrictions, ...p.numberConstrictions, ...p.stringConstrictions};
    }
    switch (p.nativeType) {
      case 'boolean':
        return this.wrapInArray(SwaggerNative.asBoolean(c[0], c[1], c[2]), wrap);
      case 'integer':
        return this.wrapInArray(SwaggerNative.asInteger(c[0], c[1], c[2]), wrap);
      case 'number':
        return this.wrapInArray(SwaggerNative.asNumber(c[0], c[1], c[2]), wrap);
      case 'string':
        return this.wrapInArray(SwaggerNative.asString(c[0], c[1], c[2]), wrap);
    }
  }
  wrapInArray(swagger, wrap?): SwaggerNative | SwaggerArray {
    if (wrap) {
      return new SwaggerArray(swagger, wrap[0], wrap[1]);
    } else {
      return swagger;
    }
  }

  addLink(obj: SwaggerObject, link): void {
    this.list.set(link, obj);
  }
  // TODO swaggerLink service to map objects
  getLink(obj: SwaggerObject): string {
    let link;
    this.list.forEach((v, k) => {
      if (v === obj) {
        link = k;
      }
    });
    console.log('ObjectListService.getLink', link);
    if (!link) {
      link = obj.orderControls.toString();
      this.list.set(link, obj);
    }
    return link;
  }
  getObject(link: string): SwaggerObject {
    return this.list.get(link);
  }
}

interface PropertyForm {
  order: number;
  fieldName: string;
  fieldType: 'SwaggerNative' | 'SwaggerArray' | 'SwaggerObject';
  itemType?: 'SwaggerNative' | 'SwaggerObject';
  nativeType?: SwaggerNativeTypes;
  objectLink?: string;
  required?: boolean;
  constriction?: BaseConstrictions;
  nativeConstrictions?: NativeConstrictions;
  numberConstrictions?: NumberConstrictions;
  stringConstrictions?: StringConstrictions;
  arrayConstrictions?: ArrayConstrictions;
  objectConstrictions?: ObjectConstrictions;
  ui?: SwaggerUI;
}
