import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OkDialogComponent } from './ok-dialog.component';
import { SimpleDialogComponent } from './simple-dialog.component';
import {ControlsModule} from '../controls';
import {SwaggerFormModule} from '../swagger-form';
import {FormsModule} from '@angular/forms';
import {ComponentsPluginService} from '../shared';
import { SnakeBarComponent } from './snake-bar.component';
@NgModule({
  declarations: [
    OkDialogComponent,
    SimpleDialogComponent,
    SnakeBarComponent
  ],
  imports: [
    CommonModule,
    ControlsModule,
    SwaggerFormModule,
    FormsModule
  ],
  exports: [
    OkDialogComponent,
    SimpleDialogComponent,
    SnakeBarComponent
  ]
})
export class DialogsModule {
  constructor(componentsPlugin: ComponentsPluginService) {
    componentsPlugin.addPlugin('simple-dialog', {component: SimpleDialogComponent, schema: null});
    componentsPlugin.addPlugin('snake-bar', {component: SnakeBarComponent, schema: null});
  }
}
