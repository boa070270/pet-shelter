import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import {
  GeneratorFormComponent,
  SwaggerArrayComponent,
  SwaggerFormComponent, SwaggerFormDirective,
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
    if (!customElements.get('lib-checkbox-control')) {
      customElements.define('lib-checkbox-control', checkboxControlComponent);
    }
    if (customElements.get('lib-input-control')) {
      customElements.define('lib-input-control', inputControlComponent);
    }
    if (customElements.get('lib-radio-control')) {
      customElements.define('lib-radio-control', radioControlComponent);
    }
    if (customElements.get('lib-select-control')) {
      customElements.define('lib-select-control', selectControlComponent);
    }
    if (customElements.get('lib-boolean-control')) {
      customElements.define('lib-boolean-control', booleanControlComponent);
    }
    if (customElements.get('lib-title-type-control')) {
      customElements.define('lib-title-type-control', titleTypeControlComponent);
    }
    if (customElements.get('lib-table-control')) {
      customElements.define('lib-table-control', tableControlComponent);
    }

    const generatorFormComponent = createCustomElement(GeneratorFormComponent, {injector});
    const swaggerFormComponent = createCustomElement(SwaggerFormComponent, {injector});
    const swaggerArrayComponent = createCustomElement(SwaggerArrayComponent, {injector});
    const swaggerNativeComponent = createCustomElement(SwaggerNativeComponent, {injector});
    const libSwaggerForm = createCustomElement(SwaggerFormDirective, {injector});
    if (customElements.get('lib-swagger-form')) {
      customElements.define('lib-swagger-form', swaggerFormComponent);
    }
    if (customElements.get('lib-generator-form')) {
      customElements.define('lib-generator-form', generatorFormComponent);
    }
    if (customElements.get('lib-swagger-array')) {
      customElements.define('lib-swagger-array', swaggerArrayComponent);
    }
    if (customElements.get('lib-swagger-native')) {
      customElements.define('lib-swagger-native', swaggerNativeComponent);
    }
    if (customElements.get('lib-swagger-native')) {
      customElements.define('lib-swagger-native', swaggerNativeComponent);
    }
    if (customElements.get('[libSwaggerForm]')) {
      customElements.define('[libSwaggerForm]', libSwaggerForm);
    }
  }

  ngOnInit(): void {
  }

}
