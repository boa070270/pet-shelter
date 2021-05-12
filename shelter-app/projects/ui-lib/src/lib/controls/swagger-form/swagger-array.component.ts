import {Component, ComponentRef, forwardRef, Inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  ArrayConstrictions,
  ArrayDataSource,
  BaseConstrictions, coerceToSwaggerArray, coerceToSwaggerNative, coerceToSwaggerObject, ComponentsPluginService,
  I18NType,
  SwaggerArray,
  SwaggerComponent,
  SwaggerNative,
  SwaggerObject
} from '../../shared';
import {TableComponent} from '../table/table.component';
import {FormErrorsService} from './form-errors.service';
import {SystemLang} from '../../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {BaseSwaggerComponent} from './base-swagger.component';
import {EditableListComponent} from "../editable-list.component";
import {CdkPortalOutlet, ComponentPortal} from "@angular/cdk/portal";
import {BaseComponent} from "../base.component";

@Component({
  selector: 'lib-swagger-array',
  template: `
    <div>
      <ng-template [cdkPortalOutlet]></ng-template>
    </div>
  `,
  styleUrls: ['./swagger-array.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwaggerArrayComponent),
    multi: true
  }]
})
export class SwaggerArrayComponent extends BaseSwaggerComponent implements OnInit, OnDestroy, ControlValueAccessor, SwaggerComponent {

  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;
  private componentRef: ComponentRef<BaseComponent>;

  dataSource = ArrayDataSource.EmptyDS();
  @Input()
  nameControl: string;

  get items(): SwaggerNative | SwaggerObject {
    return (this.swagger as SwaggerArray).items;
  }
  get constrictions(): ArrayConstrictions {
    return (this.swagger as SwaggerArray).constrictions;
  }
  get controlType(): string {
    if (this.items) {
      if (this.items instanceof SwaggerNative) {
        return 'native';
      } else if (this.items instanceof SwaggerObject) {
        return 'object';
      }
    }
  }
  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              protected formErrors: FormErrorsService, protected componentsPlugin: ComponentsPluginService) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.defineControlType();
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
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
  writeValue(obj: any): void {
    if (this.componentRef) {
      this.componentRef.instance.writeValue(obj);
    }
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
  }

  protected defineControlType(): void {
    const swagger = this.swagger as SwaggerArray;
    if (swagger) {
      const commonParams = {required: this.required, caption: this.ui.caption, hint: this.ui.description, name: this.propertyId};
      let componentName = swagger.constrictions.control;
      if (!componentName) { // TODO componentName is defined always
        if (this.items instanceof SwaggerObject) {
          componentName = 'lib-table';
        }
        if (this.items instanceof SwaggerNative) {
          componentName = 'editable-list';
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
        if (inst instanceof TableComponent) {
          inst.swagger = this.items as SwaggerObject;
          inst.dataSource = this.dataSource;
          inst.disabled = this.disabled;
          inst.customActions = this.constrictions.customTableActions;
          inst.defaultDisplay = this.constrictions.displayColumns;
          inst.tableEvent.subscribe(e => {
            this.tableAction(e);
          });
          inst.trIn = this.constrictions.trIn;
          inst.trOut = this.constrictions.trOut;
        } else if (inst instanceof EditableListComponent) {
          inst.swagger = this.items as SwaggerNative;
          // inst.extraParams = {};
        }
      }
    } else {
      console.log('SwaggerNativeComponent: No swagger');
    }
  }

  tableAction(event: {cmd: string; rows: any[]}): void {
    const a = this.constrictions.customTableActions.find(value => value.command === event.cmd);
    if (a) {
      a.action(event.rows);
    }
  }
}
