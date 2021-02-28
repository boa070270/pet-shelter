import {Injector, NgModule, Optional, SkipSelf} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BooleanControlComponent,
  CheckboxControlComponent,
  ControlsModule,
  InputControlComponent,
  RadioControlComponent,
  SelectControlComponent,
  TableComponent,
  TitleTypeControlComponent,
  GeneratorFormComponent,
  SwaggerArrayComponent,
  SwaggerFormComponent,
  SwaggerNativeComponent
} from '../controls';
import { DynamicPageComponent } from './dynamic-page.component';
import {createCustomElement} from '@angular/elements';

@NgModule({
  declarations: [DynamicPageComponent],
  imports: [
    CommonModule,
    ControlsModule,
  ],
  exports: [
    ControlsModule,
    DynamicPageComponent
  ]
})
export class UiElementsModule {
  constructor(@Optional() @SkipSelf() parentModule: UiElementsModule, injector: Injector) {
    if (parentModule) {
      throw new Error('UiElementsModule is already loaded');
    }
    const checkboxControlComponent = createCustomElement(CheckboxControlComponent, {injector});
    const inputControlComponent = createCustomElement(InputControlComponent, {injector});
    const radioControlComponent = createCustomElement(RadioControlComponent, {injector});
    const selectControlComponent = createCustomElement(SelectControlComponent, {injector});
    const booleanControlComponent = createCustomElement(BooleanControlComponent, {injector});
    const titleTypeControlComponent = createCustomElement(TitleTypeControlComponent, {injector});
    customElements.define('lib-checkbox-element', checkboxControlComponent);
    customElements.define('lib-input-element', inputControlComponent);
    customElements.define('lib-radio-element', radioControlComponent);
    customElements.define('lib-select-element', selectControlComponent);
    customElements.define('lib-boolean-element', booleanControlComponent);
    customElements.define('lib-title-type-element', titleTypeControlComponent);
    const tableComponent = createCustomElement(TableComponent, {injector});
    customElements.define('table-element', tableComponent);

    const generatorFormComponent = createCustomElement(GeneratorFormComponent, {injector});
    const swaggerFormComponent = createCustomElement(SwaggerFormComponent, {injector});
    const swaggerArrayComponent = createCustomElement(SwaggerArrayComponent, {injector});
    const swaggerNativeComponent = createCustomElement(SwaggerNativeComponent, {injector});
    customElements.define('lib-swagger-form-element', swaggerFormComponent);
    customElements.define('lib-generator-form-element', generatorFormComponent);
    customElements.define('lib-swagger-array-element', swaggerArrayComponent);
    customElements.define('lib-swagger-native-element', swaggerNativeComponent);

  }
}
