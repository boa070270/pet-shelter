import {
  AfterContentChecked,
  AfterContentInit, AfterViewChecked, AfterViewInit,
  Component,
  forwardRef,
  Host,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Optional, SimpleChanges,
  SkipSelf
} from '@angular/core';
import {
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject, CommonConstrictions, SwaggerCustomUI,
  SwaggerGroupComponent, SwaggerNative,
  SwaggerObject,
  SwaggerSchema
} from '../shared';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';

export const SWAGGER_FORM_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SwaggerFormComponent),
  multi: true
};

@Component({
  selector: 'lib-swagger-form',
  template: `
    <div *ngIf="swagger">
      <ng-container *ngFor="let fld of properties">
        <ng-container [ngSwitch]="fld.controlType">
          <lib-swagger-native [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                              [pFormGroup]="formGroup" *ngSwitchCase="'native'" [formControl]="formGroup.get(fld.propertyId)" ></lib-swagger-native>
          <lib-swagger-form [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                            [(ngModel)]="fld.propertyId" [nameControl]="fld.propertyId"
                            [pFormGroup]="formGroup" *ngSwitchCase="'object'"></lib-swagger-form>
          <lib-swagger-array [propertyId]="fld.propertyId" [swagger]="swagger.properties[fld.propertyId]" [required]="fld.required"
                             [(ngModel)]="fld.propertyId" [nameControl]="fld.propertyId"
                             [pFormGroup]="formGroup" *ngSwitchCase="'array'"></lib-swagger-array>
        </ng-container>
      </ng-container>
    </div>`,
  styleUrls: ['./swagger-form.component.scss'],
  providers: [SWAGGER_FORM_VALUE_ACCESSOR]
})
export class SwaggerFormComponent implements OnInit, SwaggerGroupComponent, OnDestroy, AfterContentInit, AfterViewInit, ControlValueAccessor {
  @Input() swagger: SwaggerSchema;
  @Input() propertyId: string;
  @Input() nameControl: string;
  @Input() required: boolean;
  @Input() pFormGroup: FormGroup;
  properties: Array<{propertyId: string, controlType: string, required: boolean, control?: AbstractControl}> = [];
  formGroup: FormGroup;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor() {
  }

  ngAfterContentInit(): void {
    this.properties.forEach(p => {
      if (p.controlType === 'native') {
        this.formGroup.addControl(p.propertyId, p.control);
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    if (this.swagger) {
      // console.log('SwaggerFormComponent.ngOnInit', this.swagger);
      const ui = this.swagger.ui || {};
      const validators = ui.validators || [];
      if (this.required && !validators.includes(Validators.required)) {
        validators.push(Validators.required);
      }
      this.formGroup = new FormGroup({}, validators, ui.asyncValidator);
      this.processProperties();
      // if (this.swaggerFromGroup) {
      //   this.swaggerFromGroup.libSwaggerFromGroup.addControl(this.nameControl, this.formGroup);
      // }
      if (this.pFormGroup) {
        this.pFormGroup.addControl(this.nameControl, this.formGroup);
      }
    } else {
      console.error('SwaggerFormComponent.ngOnInit: No swagger');
    }
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
    if (typeof obj === 'object' && obj !== null) {
      this.formGroup.setValue(obj);
    }
  }

  private processProperties(): void {
    const swagger = this.swagger as SwaggerObject;
    const required = swagger.required || [];
    if (swagger && swagger.orderControls && swagger.properties) {
      for (const propertyId of swagger.orderControls) {
        const property = swagger.properties[propertyId];
        const p: any = {propertyId, required: required.includes(propertyId)};
        if (coerceToSwaggerNative(property)) {
          p.controlType = 'native';
          p.control = this.makeFormControl(property as SwaggerNative, required.includes(propertyId));
        } else if (coerceToSwaggerObject(property)) {
          p.controlType = 'object';
        } else if (coerceToSwaggerArray(property)) {
          p.controlType = 'array';
        } else {
          continue;
        }
        this.properties.push(p);
      }
    }
  }
  makeFormControl(swagger: SwaggerNative, required): FormControl {
    const constrictions = swagger.constrictions || {} as CommonConstrictions;
    const ui = swagger.ui || {} as SwaggerCustomUI;
    const validators = ui.validators || [];
    if (required && !validators.includes(Validators.required)) {
      validators.push(Validators.required);
    }
    return new FormControl(constrictions.default, validators, ui.asyncValidator);
  }

}
