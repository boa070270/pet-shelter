import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CheckboxControlComponent} from './checkbox-control.component';
import {RadioControlComponent} from './radio-control.component';
import {BaseComponent} from './base.component';
import {InputControlComponent} from './input-control.component';
import {SelectControlComponent} from './select-control.component';
import {BooleanControlComponent} from './boolean-control.component';
import {ComponentsPluginService, SwaggerNative, SwaggerObject} from '../shared';
import {TitleTypeControlComponent} from './title-type-control.component';
import {TableComponent} from './table/table.component';
import {CdkTableModule} from '@angular/cdk/table';
import {ListBuilderComponent} from './list-builder.component';
import {ListSelectComponent} from './list-select.component';

@NgModule({
  declarations: [
    CheckboxControlComponent,
    RadioControlComponent,
    BaseComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    TitleTypeControlComponent,
    TableComponent,
    ListBuilderComponent,
    ListSelectComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CdkTableModule,
  ],
  exports: [
    CheckboxControlComponent,
    RadioControlComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    ListBuilderComponent,
    ListSelectComponent,
    TitleTypeControlComponent,
    TableComponent,
  ]
})
export class ControlsModule {
  constructor(componentsPlugin: ComponentsPluginService) {
    componentsPlugin.addPlugin('lib-boolean-control', {component: BooleanControlComponent, schema: null });
    componentsPlugin.addPlugin('boolean', {component: BooleanControlComponent, schema: null });
    componentsPlugin.addPlugin('lib-checkbox-control',
      {
        component: CheckboxControlComponent,
        schema: new SwaggerObject([], {value: SwaggerNative.asString()})
      });
    componentsPlugin.addPlugin('checkbox', {component: CheckboxControlComponent, schema: null});
    componentsPlugin.addPlugin('lib-input-control', {component: InputControlComponent, schema: null });
    componentsPlugin.addPlugin('input', {component: InputControlComponent, schema: null });
    componentsPlugin.addPlugin('lib-list-builder', {component: ListBuilderComponent, schema: null });
    componentsPlugin.addPlugin('list-builder', {component: ListBuilderComponent, schema: null });
    componentsPlugin.addPlugin('lib-list-select', {component: ListSelectComponent, schema: null });
    componentsPlugin.addPlugin('list-select', {component: ListSelectComponent, schema: null });
    componentsPlugin.addPlugin('lib-radio-control', {component: RadioControlComponent, schema: null });
    componentsPlugin.addPlugin('radio', {component: RadioControlComponent, schema: null });
    componentsPlugin.addPlugin('lib-select-control', {component: SelectControlComponent, schema: null });
    componentsPlugin.addPlugin('select', {component: SelectControlComponent, schema: null });
    componentsPlugin.addPlugin('lib-title-type-control', {component: TitleTypeControlComponent, schema: null });
    componentsPlugin.addPlugin('title-type', {component: TitleTypeControlComponent, schema: null });
    componentsPlugin.addPlugin('lib-table', {component: TableComponent, schema: null });
  }
}
// const BASE_PROPERTIES: {
//   hint: string | TitleType[];
//   error: string | TitleType[];33333333333333333
//   caption: string | TitleType[];
//
// }
