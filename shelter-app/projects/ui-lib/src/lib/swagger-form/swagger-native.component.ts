import {
  AfterViewInit,
  Component,
  ComponentRef,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  CommonConstrictions,
  ComponentsPluginService,
  SwaggerComponent,
  SwaggerCustomUI,
  SwaggerNative,
  SwaggerSchema
} from '../shared';
import {ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {BaseComponent, CheckboxControlComponent, InputControlComponent, ListBuilderComponent} from '../controls';

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
export class SwaggerNativeComponent implements OnInit, OnChanges, SwaggerComponent, AfterViewInit, ControlValueAccessor {
  @Input() swagger: SwaggerSchema;
  @Input() propertyId: string;
  @Input() required: boolean;
  @Input() pFormGroup: FormGroup;
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;
  private componentRef: ComponentRef<BaseComponent>;

  constructor(private componentsPlugin: ComponentsPluginService) {}

  writeValue(obj: any): void {
     if (this.componentRef) {
       this.componentRef.instance.writeValue(obj);
     }
  }
  registerOnChange(fn: any): void {
    if (this.componentRef) {
      this.componentRef.instance.registerOnChange(fn);
    }
  }
  registerOnTouched(fn: any): void {
    if (this.componentRef) {
      this.componentRef.instance.registerOnTouched(fn);
    }
  }
  setDisabledState?(isDisabled: boolean): void {
    if (this.componentRef) {
      this.componentRef.instance.setDisabledState(isDisabled);
    }
  }

  ngOnInit(): void {
    // console.log('SwaggerNativeComponent.ngOnInit', this.swagger, this.propertyId);
    this.defineControlType();
    // console.log('SwaggerNativeComponent.ngOnInit.after', this.swagger, this.propertyId, this.swaggerType);
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('SwaggerNativeComponent.ngOnChanges', changes);
  }
  ngAfterViewInit(): void {
    // console.log('SwaggerNativeComponent.ngAfterViewInit', this.swagger);
  }
  private defineControlType(): void {
    const swagger = this.swagger as SwaggerNative;
    if (swagger) {
      const constrictions = swagger.constrictions || {} as CommonConstrictions;
      const ui = this.swagger.ui || {} as SwaggerCustomUI;
      const commonParams = {required: this.required, caption: ui.caption, hint: ui.description, name: this.propertyId};
      let componentName = swagger.controlType;
      if (!componentName) {
        if (constrictions.enums) {
          componentName = constrictions.enums.length < 4 ? 'radio' : 'select';
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
        inst.common = {name: this.propertyId, hint: ui.description, caption: ui.caption, required: this.required,
          nameAsCaption: ui.nameAsCaption !== undefined ? ui.nameAsCaption : true};
        if (inst instanceof InputControlComponent) {
          inst.extraParams = {placeholder: ui.placeHolder, tooltip: ui.toolTip,
            leadingIcon: ui.leadingIcon, trailingIcon: ui.trailingIcon, type: constrictions.format};
        } else if (inst instanceof CheckboxControlComponent || inst instanceof ListBuilderComponent) {
          inst.extraParams = {tooltips: constrictions.enumTooltips, options: constrictions.enums, titles: constrictions.enumDescriptions};
        }
      }
    } else {
      console.log('SwaggerNativeComponent: No swagger');
    }
  }
}
