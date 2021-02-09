import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogModule} from '@angular/cdk-experimental/dialog';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DialogModule,
  ],
  exports: [
    DialogModule
  ]
})
export class DialogServiceModule { }
