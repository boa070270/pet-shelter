import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
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
  BaseConstrictions,
  NumberConstrictions,
  NativeConstrictions,
  StringConstrictions,
  ArrayConstrictions,
  ObjectConstrictions,
  SwaggerUI,
  coerceToSwaggerNative, coerceToSwaggerObject, coerceToSwaggerArray, SwaggerNativeTypes
} from '../shared';

@Component({
  selector: 'lib-swagger-builder',
  templateUrl: './swagger-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class SwaggerBuilderComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  @Input()
  swagger: SwaggerObject;
  // = new SwaggerObject(
  //   ['id', 'description', 'child'],
  //   {
  //     id: SwaggerNative.asString(),
  //     description: SwaggerNative.asString(),
  //     child: new SwaggerObject(
  //       ['childId', 'childDescription', 'sex'],
  //       {
  //         childId: SwaggerNative.asString(),
  //         childDescription: SwaggerNative.asString(),
  //         sex: SwaggerNative.asString(null, {enum: ['m', 'f']})
  //       })
  //   }, null, ['id']);

  get props(): object {
    return this.swagger.properties;
  }

  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
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

  toFrm(obj: SwaggerObject): PropertyForm[] {
    const props: PropertyForm[] = [];
    for (const property of obj.orderControls) {
      const prop = obj.properties[property];
      const p: PropertyForm = {
        order: obj.orderControls.indexOf(property),
        fieldName: property,
        fieldType: undefined
      };
      if (coerceToSwaggerNative(prop)) {
        p.fieldType = 'SwaggerNative';
        p.nativeType = (prop as SwaggerNative).type;
      } else if (coerceToSwaggerObject(prop)) {
        p.fieldType = 'SwaggerObject';
        p.objectLink = this.getLink(prop as SwaggerObject);
      } else if (coerceToSwaggerArray(prop)) {
        p.fieldType = 'SwaggerArray';
        const item = (prop as SwaggerArray).items;
        if (coerceToSwaggerNative(item)) {
          p.itemType = 'SwaggerNative';
          p.nativeType = (item as SwaggerNative).type;
        } else if (coerceToSwaggerObject(item)) {
          p.itemType = 'SwaggerObject';
          p.objectLink = this.getLink(item as SwaggerObject);
        }
      }

      props.push();
    }
    // {order: 0, fieldName: 'asd', fieldType: 'SwaggerNative', nativeType: 'integer'},
    return props;
  }

  fromFrm(): SwaggerObject {
    return new SwaggerObject([], {});
  }

  // TODO swaggerLink service to map objects
  getLink(obj: SwaggerObject): string {
    return 'TODO link';
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
