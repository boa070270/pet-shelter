import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormDirective } from './dynamic-form.directive';
import { GeneratorFormComponent } from './generator-form.component';



@NgModule({
  declarations: [
    DynamicFormDirective,
    GeneratorFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DynamicFormDirective,
    GeneratorFormComponent
  ]
})
export class DynamicFormModule { }
