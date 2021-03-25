import {Component, ComponentRef, forwardRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  coerceNativeValue,
  ComponentsPluginService,
  NativeConstrictions,
  SwaggerComponent,
  SwaggerNative
} from '../../shared';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {FormErrorsService} from './form-errors.service';
import {SystemLang} from '../../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {BaseSwaggerComponent} from './base-swagger.component';
import {BaseComponent} from '../base.component';
import {InputControlComponent} from '../input-control.component';
import {CheckboxControlComponent} from '../checkbox-control.component';
import {ListBuilderComponent} from '../list-builder.component';

@Component({
  selector: 'lib-swagger-native',
  template: `
    <div class="ui-swagger-native">
      <ng-template [cdkPortalOutlet]></ng-template>
    </div>`,
  styleUrls: ['./swagger-native.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwaggerNativeComponent),
    multi: true
  }]
})
export class SwaggerNativeComponent extends BaseSwaggerComponent implements OnInit, OnDestroy, SwaggerComponent, ControlValueAccessor {
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;
  private componentRef: ComponentRef<BaseComponent>;
  get constrictions(): NativeConstrictions {
    return this._swagger.constrictions;
  }
  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              protected componentsPlugin: ComponentsPluginService,
              protected formErrors: FormErrorsService) {
    super(systemLang, directionality);
  }

  writeValue(obj: any): void {
     if (this.componentRef) {
       this.componentRef.instance.writeValue(obj);
     }
  }
  registerOnChange(fn: any): void {
    if (this.componentRef) {
      const coerce = coerceNativeValue((this.swagger as SwaggerNative).type);
      this.componentRef.instance.registerOnChange((v) => fn(coerce(v)));
    }
  }
  registerOnTouched(fn: any): void {
    if (this.componentRef) {
      this.componentRef.instance.registerOnTouched(fn);
    }
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
    if (this.componentRef) {
      this.componentRef.instance.setDisabledState(isDisabled);
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.defineControlType();
    this.isReadOnly();
  }
  /**
   * we recognize empty as null, undefined, or equals to default
   * @private
   */
  private isValueEmpty(def: any): boolean {
    if (this.formControl) {
      const value = this.formControl.value;
      return value === null || value === undefined || value === def;
    }
    return false;
  }
  /**
   * Disables this control if it doesn't disabled already and:
   * - constrictions has readOnly
   * - constrictions has immutable and the value of this control isn't empty
   * @private
   */
  private isReadOnly(): void {
    if (!this.disabled) {
      if (this.constrictions.readOnly || (this.constrictions.immutable && this.isValueEmpty(this.constrictions.default))) {
        this.formControl.disable();
      }
    }
  }
  protected defineControlType(): void {
    const swagger = this.swagger as SwaggerNative;
    if (swagger) {
      const commonParams = {required: this.required, caption: this.ui.caption, hint: this.ui.description, name: this.propertyId};
      let componentName = swagger.controlType;
      if (!componentName) { // TODO componentName is defined always
        if (this.constrictions.enum) {
          componentName = this.constrictions.enum.length < 4 ? 'radio' : 'select';
        }
        if (swagger.type === 'string' || swagger.type === 'number' || swagger.type === 'integer') {
          componentName = 'input';
        }
      }
      const component = this.componentsPlugin.getPlugin(componentName);
      if (component && component.component) {
        const portal = new ComponentPortal(component.component);
        this.componentRef = this.portalOutlet.attachComponentPortal(portal);
        this.componentRef.instance.common = commonParams;
        const inst = this.componentRef.instance;
        inst.common = {name: this.propertyId, hint: this.ui.description, caption: this.ui.caption, required: this.required,
          nameAsCaption: this.ui.nameAsCaption !== undefined ? this.ui.nameAsCaption : true};
        if (inst instanceof InputControlComponent) {
          inst.extraParams = {placeholder: this.ui.placeHolder, tooltip: this.ui.toolTip,
            leadingIcon: this.ui.leadingIcon, trailingIcon: this.ui.trailingIcon, type: this.constrictions.format};
        } else if (inst instanceof CheckboxControlComponent || inst instanceof ListBuilderComponent) {
          inst.extraParams = {tooltips: this.constrictions.enumTooltips, options: this.constrictions.enum,
            titles: this.constrictions.enumDescriptions};
        }
      }
    } else {
      console.log('SwaggerNativeComponent: No swagger');
    }
  }

  protected onStatusChange(status: any): void {
    super.onStatusChange(status);
    switch (status) {
      case 'VALID': // This control has passed all validation checks.
        if (this.componentRef) {
          this.componentRef.instance.error = null;
        }
        break;
      case 'INVALID' : // This control has failed at least one validation check.
        if (this.componentRef) {
          this.componentRef.instance.error = this.formErrors.getError(this.formControl.errors);
        }
        break;
      // case 'PENDING' : // This control is in the midst of conducting a validation check.
      //   break;
      // case 'DISABLED' : // This control is exempt from validation checks.
      //   break;
    }
  }
}
