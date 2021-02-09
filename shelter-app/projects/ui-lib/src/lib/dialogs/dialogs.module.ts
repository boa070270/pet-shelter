import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogModule} from '@angular/cdk-experimental/dialog';
import { OkDialogComponent } from './ok-dialog.component';
import { SimpleDialogComponent } from './simple-dialog.component';
import {ControlsModule} from '../controls';
import {SwaggerFormModule} from '../swagger-form';
import {FormsModule} from "@angular/forms";
@NgModule({
  declarations: [
    OkDialogComponent,
    SimpleDialogComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    ControlsModule,
    SwaggerFormModule,
    FormsModule
  ],
  exports: [
    DialogModule,
    OkDialogComponent,
    SimpleDialogComponent
  ]
})
export class DialogsModule { }
