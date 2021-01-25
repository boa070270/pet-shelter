import {NgModule} from '@angular/core';
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
    TableRowSelectorDirective,
  ]
})
export class ControlsModule {
}
