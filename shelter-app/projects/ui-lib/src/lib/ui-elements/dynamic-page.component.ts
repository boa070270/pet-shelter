import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {createCustomElement} from '@angular/elements';
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
  SelectControlComponent,
  TableComponent,
  TitleTypeControlComponent
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
    const tableControlComponent = createCustomElement(TableComponent, {injector});
    if (!customElements.get('lib-checkbox-element')) {
      customElements.define('lib-checkbox-element', checkboxControlComponent);
    }
    if (!customElements.get('lib-input-element')) {
      customElements.define('lib-input-element', inputControlComponent);
    }
    if (!customElements.get('lib-radio-element')) {
      customElements.define('lib-radio-element', radioControlComponent);
    }
    if (!customElements.get('lib-select-element')) {
      customElements.define('lib-select-element', selectControlComponent);
    }
    if (!customElements.get('lib-boolean-element')) {
      customElements.define('lib-boolean-element', booleanControlComponent);
    }
    if (!customElements.get('lib-title-type-element')) {
      customElements.define('lib-title-type-element', titleTypeControlComponent);
    }
    if (!customElements.get('lib-table-element')) {
      customElements.define('lib-table-element', tableControlComponent);
    }

    const generatorFormComponent = createCustomElement(GeneratorFormComponent, {injector});
    const swaggerFormComponent = createCustomElement(SwaggerFormComponent, {injector});
    const swaggerArrayComponent = createCustomElement(SwaggerArrayComponent, {injector});
    const swaggerNativeComponent = createCustomElement(SwaggerNativeComponent, {injector});
    // const libSwaggerForm = createCustomElement(SwaggerFormDirective, {injector});
    if (!customElements.get('lib-swagger-form-element')) {
      customElements.define('lib-swagger-form-element', swaggerFormComponent);
    }
    if (!customElements.get('lib-generator-form-element')) {
      customElements.define('lib-generator-form-element', generatorFormComponent);
    }
    if (!customElements.get('lib-swagger-array-element')) {
      customElements.define('lib-swagger-array-element', swaggerArrayComponent);
    }
    if (!customElements.get('lib-swagger-native-element')) {
      customElements.define('lib-swagger-native-element', swaggerNativeComponent);
    }
    // if (customElements.get('lib-swagger-native')) {
    //   customElements.define('lib-swagger-native', swaggerNativeComponent);
    // }
    // if (customElements.get('[libSwaggerForm]')) {
    //   customElements.define('[libSwaggerForm]', libSwaggerForm);
    // }
  }

  ngOnInit(): void {
  }
}
