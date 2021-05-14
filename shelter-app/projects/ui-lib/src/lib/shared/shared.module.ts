import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RootPageComponent } from './root-page.component';

@NgModule({
  declarations: [
  RootPageComponent],
  imports: [
    CommonModule
  ],
  exports: [
    RootPageComponent
  ]
})
export class SharedModule {
}
