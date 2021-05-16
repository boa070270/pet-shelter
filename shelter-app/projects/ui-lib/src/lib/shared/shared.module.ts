import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RootPageComponent } from './root-page.component';
import {BROWSER_STORAGE, ROOT_PAGE_DATA, SYSTEM_LANG_TOKEN} from './services-api';
import {SystemLangImpl} from './system-lang.service';
import {BrowserStorageService} from './storage.service';
import {RootPageServiceImpl} from './root-page.service';

@NgModule({
  declarations: [
    RootPageComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RootPageComponent,
  ],
  providers: [
    {provide: SYSTEM_LANG_TOKEN, useClass: SystemLangImpl},
    {provide: BROWSER_STORAGE, useClass: BrowserStorageService},
    {provide: ROOT_PAGE_DATA, useClass: RootPageServiceImpl}
  ]
})
export class SharedModule {
}
