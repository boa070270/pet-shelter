import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogModule} from '@angular/cdk-experimental/dialog';
import { ModalDialogComponent } from './modal-dialog.component';
import { OkDialogComponent } from './ok-dialog.component';
import { SimpleDialogComponent } from './simple-dialog.component';
import {ControlsModule} from '../controls';
import {SwaggerFormModule} from '../swagger-form';
@NgModule({
  declarations: [
    OkDialogComponent,
    ModalDialogComponent,
    SimpleDialogComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    ControlsModule,
    SwaggerFormModule
  ],
  exports: [
    DialogModule,
    OkDialogComponent,
    ModalDialogComponent,
    SimpleDialogComponent
  ]
})
export class DialogsModule { }
