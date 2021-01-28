import {Input, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CheckboxControlComponent} from './checkbox-control.component';
import {ButtonComponent} from './button/button.component';
import {RadioControlComponent} from './radio-control.component';
import {BaseControlComponent} from './base-control.component';
import {InputControlComponent} from './input-control.component';
import {SelectControlComponent} from './select-control.component';
import {BooleanControlComponent} from './boolean-control.component';
import { TableControlComponent } from './table/table-control.component';
import {ComponentsPluginService, PROPERTY_STRING, TitleType} from '../shared';
import { TitleTypeControlComponent } from './title-type-control.component';
import { TableRowSelectorDirective } from './table/table-row-selector.directive';
import { TableControlDirective } from './table/table-control.directive';
import { TableCellDataDirective } from './table/table-cell-data.directive';

@NgModule({
  declarations: [
    ButtonComponent,
    CheckboxControlComponent,
    RadioControlComponent,
    BaseControlComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    TableControlComponent,
    TitleTypeControlComponent,
    TableRowSelectorDirective,
    TableControlDirective,
    TableCellDataDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    ButtonComponent,
    CheckboxControlComponent,
    RadioControlComponent,
    InputControlComponent,
    SelectControlComponent,
    BooleanControlComponent,
    TableControlComponent,
    TitleTypeControlComponent,
    TableRowSelectorDirective,
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
//   error: string | TitleType[];
//   caption: string | TitleType[];
//
// }
