import {NgModule, Optional, SkipSelf} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ControlsModule} from '../controls';
import {SurveyModule} from '../survey';
import {SwaggerFormModule} from '../swagger-form';
import { DynamicPageComponent } from './dynamic-page.component';

@NgModule({
  declarations: [DynamicPageComponent],
  imports: [
    CommonModule,
    ControlsModule,
    SurveyModule,
    SwaggerFormModule
  ],
  exports: [
    ControlsModule,
    SurveyModule,
    SwaggerFormModule,
    DynamicPageComponent
  ]
})
export class UiElementsModule {
  constructor(@Optional() @SkipSelf() parentModule: UiElementsModule) {
    if (parentModule) {
      throw new Error('UiElementsModule is already loaded');
    }
  }
}
