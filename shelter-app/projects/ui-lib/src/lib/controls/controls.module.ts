import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CheckboxControlComponent} from './checkbox-control.component';
import { ButtonComponent } from './button/button.component';
import { RadioControlComponent } from './radio-control.component';
import { BaseControlComponent } from './base-control.component';
import { InputControlComponent } from './input-control.component';
import {FormsModule} from '@angular/forms';
import { SelectControlComponent } from './select-control.component';

@NgModule({
  declarations: [
    ButtonComponent,
    CheckboxControlComponent,
    RadioControlComponent,
    BaseControlComponent,
    InputControlComponent,
    SelectControlComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        // FormsModule
    ],
  exports: [
    ButtonComponent,
    CheckboxControlComponent,
    RadioControlComponent,
    InputControlComponent,
    SelectControlComponent,
  ]
})
export class ControlsModule { }
