import {Input, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CheckboxControlComponent} from './checkbox-control.component';
import {RadioControlComponent} from './radio-control.component';
import {BaseComponent} from './base.component';
import {InputControlComponent} from './input-control.component';
import {SelectControlComponent} from './select-control.component';
import {BooleanControlComponent} from './boolean-control.component';
import { TableComponent } from './table/table.component';
import {ComponentsPluginService, PROPERTY_STRING, TitleType} from '../shared';
import { TitleTypeControlComponent } from './title-type-control.component';
import { TableRowSelectorDirective } from './table/table-row-selector.directive';
import { TableControlDirective } from './table/table-control.directive';
import { TableCellDataDirective } from './table/table-cell-data.directive';
import { TableGeneratorComponent } from './table/table-generator.component';
import { TableCdkComponent } from './table/table-cdk.component';
import { TestTableComponent } from './table/test-table/test-table.component';
import {CdkTableModule} from '@angular/cdk/table';
import { ListBuilderComponent } from './list-builder.component';
import { ListSelectComponent } from './list-select.component';

@NgModule({
  declarations: [
    CheckboxControlComponent,
    RadioControlComponent,
    BaseComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    TableComponent,
    TitleTypeControlComponent,
    TableRowSelectorDirective,
    TableControlDirective,
    TableCellDataDirective,
    TableGeneratorComponent,
    TableCdkComponent,
    TestTableComponent,
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
    TableComponent,
    TitleTypeControlComponent,
    TableRowSelectorDirective,
    ListBuilderComponent,
    ListSelectComponent
  ]
})
export class ControlsModule {
  constructor(componentsPlugin: ComponentsPluginService) {
    componentsPlugin.addPlugin('lib-checkbox-control',
      {
        component: CheckboxControlComponent,
        schema: {
          orderControls: [],
          properties: {
            value: PROPERTY_STRING,
          }
      }});
  }
}
// const BASE_PROPERTIES: {
//   hint: string | TitleType[];
//   error: string | TitleType[];33333333333333333
//   caption: string | TitleType[];
//
// }
