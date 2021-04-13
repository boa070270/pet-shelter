import {AfterContentInit, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
  coerceToSwaggerArray,
  coerceToSwaggerNative,
  coerceToSwaggerObject,
  NativeConstrictions, NumberConstrictions,
  Rule, StringConstrictions,
  SwaggerArray,
  SwaggerGroupComponent,
  SwaggerNative,
  SwaggerObject
} from '../../shared';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR, ValidatorFn,
  Validators
} from '@angular/forms';
import {BaseSwaggerComponent} from './base-swagger.component';
import {SystemLang} from '../../i18n';
import {Directionality} from '@angular/cdk/bidi';

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
          <lib-swagger-native [propertyId]="fld.propertyId" [swagger]="swaggerProperties[fld.propertyId]" [required]="fld.required"
                              [pFormGroup]="formGroup" *ngSwitchCase="'native'" [formControl]="fld.control" [ngStyle]="fld.style"></lib-swagger-native>
          <lib-swagger-form [propertyId]="fld.propertyId" [swagger]="swaggerProperties[fld.propertyId]" [required]="fld.required"
                            [(ngModel)]="fld.propertyId" [nameControl]="fld.propertyId" [ngStyle]="fld.style"
                            [pFormGroup]="formGroup" *ngSwitchCase="'object'"></lib-swagger-form>
          <lib-swagger-array [propertyId]="fld.propertyId" [swagger]="swaggerProperties[fld.propertyId]" [required]="fld.required"
                             [pFormGroup]="formGroup" *ngSwitchCase="'array'" [formControl]="fld.control" [ngStyle]="fld.style"></lib-swagger-array>
        </ng-container>
      </ng-container>
    </div>`,
  styleUrls: ['./swagger-form.component.scss'],
  providers: [SWAGGER_FORM_VALUE_ACCESSOR]
})
// tslint:disable-next-line:max-line-length
export class SwaggerFormComponent extends BaseSwaggerComponent implements OnInit, SwaggerGroupComponent, AfterContentInit, OnDestroy, ControlValueAccessor {
  @Input() nameControl: string;
  @Input() readOnly: boolean;
  properties: Array<{propertyId: string, controlType: string, required: boolean, control?: AbstractControl, style?: any}> = [];
  formGroup: FormGroup;
  get swaggerProperties(): any {
    return (this._swagger as SwaggerObject).properties;
  }
  get behavior(): { [field: string]: Rule[]; } {
    return (this._swagger as SwaggerObject).behavior;
  }

  constructor(public systemLang: SystemLang, protected directionality: Directionality, protected changeDetector: ChangeDetectorRef) {
    super(systemLang, directionality);
  }

  ngAfterContentInit(): void {
    this.properties.forEach(p => {
      if (p.controlType !== 'object') {
        this.formGroup.addControl(p.propertyId, p.control);
      }
    });
    if (this.readOnly) {
      this.formGroup.disable();
    }
    if (this.swagger && this.behavior) {
      this.applyRules(this.formGroup.value);
      this.formGroup.valueChanges.subscribe(d => this.applyRules(d));
    }
  }

  ngOnInit(): void {
    if (this.swagger) {
      const validators = this.swagger.constrictions.validators || [];
      if (this.required && !validators.includes(Validators.required)) {
        validators.push(Validators.required);
      }
      this.formGroup = new FormGroup({}, validators, this.swagger.constrictions.asyncValidator);
      this.processProperties();
      if (this.pFormGroup) {
        this.pFormGroup.addControl(this.nameControl, this.formGroup);
      }
    } else {
      console.error('SwaggerFormComponent.ngOnInit: No swagger');
    }
  }

  writeValue(obj: any): void {
    console.log('SwaggerFormComponent.writeValue', obj);
    if (typeof obj === 'object' && obj !== null) {
      this.formGroup.patchValue(obj);
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
          p.control = this.makeArrayControl((property as SwaggerArray).items, required.includes(propertyId));
        } else {
          continue;
        }
        this.properties.push(p);
      }
    }
  }
  makeFormControl(swagger: SwaggerNative, required): FormControl {
    const constrictions = swagger.constrictions || {} as NativeConstrictions;
    // was: const validators = this.swagger.constrictions.validators || [];
    const validators = swagger.constrictions.validators || [];
    if (required && !validators.includes(Validators.required)) {
      validators.push(Validators.required);
    }
    CustomValidators.applyConstraints(validators, swagger.constrictions);
    return new FormControl(constrictions.default, validators, this.swagger.constrictions.asyncValidator);
  }

  makeArrayControl(swagger: SwaggerNative | SwaggerObject, required): FormControl {
    if (swagger) {
      // FormArray doesn't have registerOnChange, so we need to use simple FormControl
      return new FormControl();
    }
  }

  private applyRules(d: any): void {
    Object.keys(this.behavior).forEach( r => {
      const rules = this.behavior[r];
      let value: string;
      if (r.charAt(0) === '$') {
        value = '' + this.pFormGroup.value[r];
      } else {
        value = '' + d[r];
      }
      for (const rule of rules) {
        if (rule.c) {
          let cond: string;
          let seq = false;
          let expect: string;
          if (rule.c.charAt(0) === ',') {
            seq = true;
            cond = rule.c.charAt(1);
            expect = rule.c.substring(2);
          } else {
            cond = rule.c.charAt(0);
            expect = rule.c.substring(1);
          }
          switch (cond) {
            case '<':
              if (value < expect) {
                this.applyRule(rule);
              }
              break;
            case '>':
              if (value > expect) {
                this.applyRule(rule);
              }
              break;
            case '!':
              if (seq) {
                const ex = expect.split(',');
                for (const e of ex) {
                  if (value !== e) {
                    this.applyRule(rule);
                    break;
                  }
                }
              } else {
                if (value !== expect) {
                  this.applyRule(rule);
                }
              }
              break;
            case '=':
              if (seq) {
                const ex = expect.split(',');
                for (const e of ex) {
                  if (value === e) {
                    this.applyRule(rule);
                    break;
                  }
                }
              } else {
                if (value === expect) {
                  this.applyRule(rule);
                }
              }
              break;
          }
        }
      }
      this.changeDetector.detectChanges();
    });
  }
  private applyRule(r: Rule): void {
    if (Array.isArray(r.disable)) {
      for (const fld of r.disable) {
        const ctrl = this.formGroup.get(fld);
        if (ctrl) {
          ctrl.disable();
        }
      }
    }
    if (Array.isArray(r.enable)) {
      for (const fld of r.enable) {
        const ctrl = this.formGroup.get(fld);
        if (ctrl) {
          ctrl.enable();
        }
      }
    }
    if (Array.isArray(r.hide)) {
      for (const fld of r.hide) {
        const p = this.properties.find(f => f.propertyId === fld);
        if (p) {
          p.style = {display: 'none'}; // {visibility: 'collapse'};
        }
      }
    }
    if (Array.isArray(r.show)) {
      for (const fld of r.show) {
        const p = this.properties.find(f => f.propertyId === fld);
        if (p) {
          p.style = null;
        }
      }
    }
  }
}
abstract class CustomValidators {
  static applyConstraints(v: ValidatorFn[], c): void {
    if (!c) {
      return;
    }
    if (c.minimum) {
      v.push(Validators.min(c.minimum));
    }
    if (c.maximum) {
      v.push(Validators.max(c.maximum));
    }
    if (c.exclusiveMinimum) {
      v.push(CustomValidators.exclusiveMin(c.exclusiveMinimum));
    }
    if (c.exclusiveMaximum) {
      v.push(CustomValidators.exclusiveMax(c.exclusiveMaximum));
    }
    if (c.multipleOf) {
      v.push(CustomValidators.multipleOf(c.multipleOf));
    }
    if (c.minLength) {
      v.push(Validators.minLength(c.minLength));
    }
    if (c.maxLength) {
      v.push(Validators.maxLength(c.maxLength));
    }
    if (c.pattern) {
      v.push(Validators.pattern(c.pattern));
    }
  }
  static exclusiveMin(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value <= min) {
        return { exclusiveMin: true };
      }
    };
  }
  static exclusiveMax(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value >= max) {
        return { exclusiveMax: true };
      }
    };
  }
  static multipleOf(mul: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!(control.value % mul)) {
        return { multipleOf: true };
      }
    };
  }
}
