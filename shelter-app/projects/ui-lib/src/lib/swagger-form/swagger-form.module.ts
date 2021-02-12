import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratorFormComponent } from './generator-form.component';
import {SwaggerArrayComponent} from './swagger-array.component';
import {SwaggerFormComponent} from './swagger-form.component';
import { SwaggerNativeComponent } from './swagger-native.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlsModule} from '../controls';
import {PortalModule} from '@angular/cdk/portal';

@NgModule({
  declarations: [
    GeneratorFormComponent,
    SwaggerFormComponent,
    SwaggerArrayComponent,
    SwaggerNativeComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        ControlsModule,
        ReactiveFormsModule,
        PortalModule
    ],
  exports: [
    GeneratorFormComponent,
    SwaggerFormComponent,
    SwaggerArrayComponent,
    SwaggerNativeComponent,
  ]
})
export class SwaggerFormModule { }
