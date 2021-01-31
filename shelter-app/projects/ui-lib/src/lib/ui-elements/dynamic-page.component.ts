import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import {
  GeneratorFormComponent,
  SwaggerArrayComponent,
  SwaggerFormComponent,
  SwaggerNativeComponent
} from '../swagger-form';
import {
  BooleanControlComponent,
  CheckboxControlComponent,
  InputControlComponent,
  RadioControlComponent,
  SelectControlComponent, TableControlComponent, TitleTypeControlComponent
} from '../controls';

@Component({
  selector: 'lib-dynamic-page',
  template: '<ng-template #container></ng-template>',
  styleUrls: ['./dynamic-page.component.css']
})
export class DynamicPageComponent implements OnInit {
  @ViewChild('container') container;
  constructor(private element: ElementRef,
              private injector: Injector) {
    const checkboxControlComponent = createCustomElement(CheckboxControlComponent, {injector});
    const inputControlComponent = createCustomElement(InputControlComponent, {injector});
    const radioControlComponent = createCustomElement(RadioControlComponent, {injector});
    const selectControlComponent = createCustomElement(SelectControlComponent, {injector});
    const booleanControlComponent = createCustomElement(BooleanControlComponent, {injector});
    const titleTypeControlComponent = createCustomElement(TitleTypeControlComponent, {injector});
    const tableControlComponent = createCustomElement(TableControlComponent, {injector});
    customElements.define('lib-checkbox-control', checkboxControlComponent);
    customElements.define('lib-input-control', inputControlComponent);
    customElements.define('lib-radio-control', radioControlComponent);
    customElements.define('lib-select-control', selectControlComponent);
    customElements.define('lib-boolean-control', booleanControlComponent);
    customElements.define('lib-title-type-control', titleTypeControlComponent);
    customElements.define('lib-table-control', tableControlComponent);

    const generatorFormComponent = createCustomElement(GeneratorFormComponent, {injector});
    const swaggerFormComponent = createCustomElement(SwaggerFormComponent, {injector});
    const swaggerArrayComponent = createCustomElement(SwaggerArrayComponent, {injector});
    const swaggerNativeComponent = createCustomElement(SwaggerNativeComponent, {injector});
    customElements.define('lib-swagger-form', swaggerFormComponent);
    customElements.define('lib-generator-form', generatorFormComponent);
    customElements.define('lib-swagger-array', swaggerArrayComponent);
    customElements.define('lib-swagger-native', swaggerNativeComponent);
  }

  ngOnInit(): void {
  }

}
