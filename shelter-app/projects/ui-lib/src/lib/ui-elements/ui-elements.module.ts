import {ComponentFactoryResolver, Injector, NgModule, Optional, SkipSelf} from '@angular/core';
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
  SwaggerNativeComponent, AppBarComponent, LinkComponent, CardComponent, CardContentDirective,
  TabGroupComponent, AccordionComponent, SpanComponent
} from '../controls';
import { DynamicPageComponent } from './dynamic-page.component';
import {createCustomElement} from '@angular/elements';
import {ExtComponentFactory} from "../shared/ext-component-factory";

@NgModule({
  declarations: [DynamicPageComponent],
  imports: [
    CommonModule,
    ControlsModule,
  ],
  exports: [
    ControlsModule,
    DynamicPageComponent,
  ]
})
export class UiElementsModule {
  constructor(@Optional() @SkipSelf() parentModule: UiElementsModule, injector: Injector) {
    if (parentModule) {
      throw new Error('UiElementsModule is already loaded');
    }
    const replaceInjector = Injector.create({parent: injector, providers: [
        {provide: ComponentFactoryResolver, useValue: new ExtComponentFactory(injector)}
      ]});
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
    const appBar = createCustomElement(AppBarComponent, {injector});
    customElements.define('app-bar', appBar);
    const link = createCustomElement(LinkComponent, {injector});
    customElements.define('lib-link', link);
    const inputTitle = createCustomElement(TitleTypeControlComponent, {injector});
    customElements.define('lib-input-title', inputTitle);
    const card = createCustomElement(CardComponent, {injector});
    customElements.define('lib-card-element', card);
    const tabGroup = createCustomElement(TabGroupComponent, {injector: replaceInjector});
    customElements.define('lib-tab-group-element', tabGroup);
    const accordion = createCustomElement(AccordionComponent, {injector: replaceInjector});
    customElements.define('lib-accordion-element', accordion);
    const span = createCustomElement(SpanComponent, {injector});
    customElements.define('ui-span', span);

  }
}
