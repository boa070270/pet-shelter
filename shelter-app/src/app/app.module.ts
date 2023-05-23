import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {
  ControlsModule, CUSTOM_DS_SERVICE,
  DialogServiceModule, EditorStoreToken,
  EXT_SYSTEM_LANG,
  LoggerModule,
  SharedModule,
  // UiElementsModule,
  UILoggerWriterToken,
  WysiwygModule
} from 'ui-lib';
import {HttpClientModule} from '@angular/common/http';
import {MainPageComponent} from './main-page.component';
import {TopMenuPageComponent} from './top-menu-page.component';
import {SubMenuPageComponent} from './sub-menu-page/sub-menu-page.component';
import {FormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {SearchPageComponent} from './search-page.component';
import {ShelterCommonModule} from './common';
import {MenuPageComponent} from './menu-page.component';
import {BasicService} from './basic.service';
import {TestDynamicComponent} from './test-dynamic.component';
import {LogWriterService} from './log-writer.service';
import {TestEditorComponent} from './test-editor.component';
import {CustomDSServiceMock} from './mock/custom-dsservice-mock';
import {EditorStoreMock} from './mock/EditorStoreMock';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    TopMenuPageComponent,
    SubMenuPageComponent,
    SearchPageComponent,
    MenuPageComponent,
    TestDynamicComponent,
    TestEditorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ScrollingModule,
    WysiwygModule,
    ShelterCommonModule,
    SharedModule,
    ControlsModule,
    // UiElementsModule,
    LoggerModule,
    DialogServiceModule,
  ],
  providers: [
    {provide: EXT_SYSTEM_LANG, useClass: BasicService},
    {provide: UILoggerWriterToken, useClass: LogWriterService},
    {provide: CUSTOM_DS_SERVICE, useClass: CustomDSServiceMock},
    {provide: EditorStoreToken, useClass: EditorStoreMock}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
