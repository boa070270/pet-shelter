import {Component, forwardRef, Host, Input, OnDestroy, OnInit, Optional, SkipSelf} from '@angular/core';
import {
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject,
  SwaggerGroupComponent,
  SwaggerObject,
  SwaggerSchema
} from './swagger-object';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {SwaggerFromGroupDirective} from './swagger-from-group.directive';

export const SWAGGER_FORM_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SwaggerFormComponent),
  multi: true
};

@Component({
  selector: 'lib-swagger-form',
  template: `
    <div *ngIf="swagger" [libSwaggerFromGroup]="formGroup">
      <ng-container *ngFor="let fld of properties">
        <ng-container [ngSwitch]="fld.controlType">
          <lib-swagger-native [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                              *ngSwitchCase="'native'"></lib-swagger-native>
          <lib-swagger-form [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                            [(ngModel)]="fld.propertyId" [nameControl]="fld.propertyId"
                            *ngSwitchCase="'object'"></lib-swagger-form>
          <lib-swagger-array [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                             [(ngModel)]="fld.propertyId" [nameControl]="fld.propertyId"
                             *ngSwitchCase="'array'"></lib-swagger-array>
        </ng-container>
      </ng-container>
    </div>`,
  styleUrls: ['./swagger-form.component.scss'],
  providers: [SWAGGER_FORM_VALUE_ACCESSOR]
})
export class SwaggerFormComponent implements OnInit, SwaggerGroupComponent, OnDestroy, ControlValueAccessor  {
  @Input() swagger: SwaggerSchema;
  @Input() propertyId: string;
  @Input() nameControl: string;
  @Input() required: boolean;
  properties: Array<{propertyId: string, controlType: string, required: boolean}> = [];
  formGroup: FormGroup;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(@Optional() @Host() @SkipSelf() public swaggerFromGroup: SwaggerFromGroupDirective) {
  }

  ngOnInit(): void {
    const ui = this.swagger.ui || {};
    this.processProperties();
    const validators = ui.validators || [];
    if (this.required && !validators.includes(Validators.required)) {
      validators.push(Validators.required);
    }
    this.formGroup = new FormGroup({}, validators, ui.asyncValidator);
    if (this.swaggerFromGroup) {
      this.swaggerFromGroup.libSwaggerFromGroup.addControl(this.nameControl, this.formGroup);
    }
  }
  ngOnDestroy(): void {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
    console.log('SwaggerFormComponent.writeValue', obj);
  }

  private processProperties(): void {
    const swagger = this.swagger as SwaggerObject;
    const required = swagger.required || [];
    if (swagger && swagger.orderControls && swagger.properties) {
      for (const propertyId of swagger.orderControls) {
        const property = swagger.properties[propertyId];
        let controlType = null;
        if (coerceToSwaggerNative(property)) {
          controlType = 'native';
        } else if (coerceToSwaggerObject(property)) {
          controlType = 'object';
        } else if (coerceToSwaggerArray(property)) {
          controlType = 'array';
        } else {
          continue;
        }
        this.properties.push({propertyId, controlType, required: required.includes(propertyId)});
      }
    }
  }
}
