import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratorFormComponent } from './generator-form.component';
import {SwaggerArrayComponent} from './swagger-array.component';
import {SwaggerFormComponent} from './swagger-form.component';
import { SwaggerNativeComponent } from './swagger-native.component';
import { SwaggerFormDirective } from './swagger-form.directive';
import {SwaggerControlDirective} from './swagger-control.directive';
import { SwaggerNativeDirective } from './swagger-native.directive';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlsModule} from '../controls';
import { SwaggerFormGroupDirective } from './swagger-form-group.directive';

@NgModule({
  declarations: [
    GeneratorFormComponent,
    SwaggerFormComponent,
    SwaggerArrayComponent,
    SwaggerNativeComponent,
    SwaggerFormDirective,
    SwaggerControlDirective,
    SwaggerNativeDirective,
    SwaggerFormGroupDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ControlsModule,
    ReactiveFormsModule
  ],
  exports: [
    GeneratorFormComponent,
    SwaggerFormComponent,
    SwaggerArrayComponent,
    SwaggerNativeComponent,
    SwaggerFormDirective,
    SwaggerControlDirective,
    SwaggerNativeDirective,
    SwaggerFormGroupDirective,
  ]
})
export class SwaggerFormModule { }
