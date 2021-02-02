import {Injector, NgModule, Optional, SkipSelf} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BooleanControlComponent,
  CheckboxControlComponent,
  ControlsModule,
  InputControlComponent,
  RadioControlComponent,
  SelectControlComponent, TableControlComponent, TableGeneratorComponent, TitleTypeControlComponent
} from '../controls';
import {SurveyModule} from '../survey';
import {
  GeneratorFormComponent,
  SwaggerArrayComponent,
  SwaggerFormComponent,
  SwaggerFormModule,
  SwaggerNativeComponent
} from '../swagger-form';
import { DynamicPageComponent } from './dynamic-page.component';
import {createCustomElement} from '@angular/elements';

@NgModule({
  declarations: [DynamicPageComponent],
  imports: [
    CommonModule,
    ControlsModule,
    SurveyModule,
    SwaggerFormModule
  ],
  exports: [
    ControlsModule,
    SurveyModule,
    SwaggerFormModule,
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
    const tableControlComponent = createCustomElement(TableControlComponent, {injector});
    const tableGeneratorComponent = createCustomElement(TableGeneratorComponent, {injector});
    customElements.define('lib-checkbox-element', checkboxControlComponent);
    customElements.define('lib-input-element', inputControlComponent);
    customElements.define('lib-radio-element', radioControlComponent);
    customElements.define('lib-select-element', selectControlComponent);
    customElements.define('lib-boolean-element', booleanControlComponent);
    customElements.define('lib-title-type-element', titleTypeControlComponent);
    customElements.define('lib-table-element', tableControlComponent);
    customElements.define('lib-table-generator-element', tableGeneratorComponent);

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
