import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DsDataComponent} from './ds-data.component';
import {DsComponent} from './ds.component';
import {ControlsModule} from "../controls";

@NgModule({
  declarations: [
    DsDataComponent,
    DsComponent
  ],
  imports: [
    CommonModule,
    ControlsModule
  ],
  exports: [
    DsDataComponent,
    DsComponent
  ]
})
export class DataSourceDefModule { }
