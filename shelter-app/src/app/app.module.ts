import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {
  UiLibModule,
  SharedModule,
  ControlsModule,
  ObtainSystemLanguage,
  UiElementsModule,
  LoggerModule,
  DialogServiceModule,
  MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
  DIALOG_REF,
  DialogRef,
  DIALOG_CONTAINER, CdkDialogContainer, DIALOG_CONFIG, DialogConfig
} from 'ui-lib';
import {HttpClientModule} from '@angular/common/http';
import { MainPageComponent } from './main-page.component';
import { TopMenuPageComponent } from './top-menu-page.component';
import { SubMenuPageComponent } from './sub-menu-page/sub-menu-page.component';
import {FormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AngularWysiwygEditorLibModule} from '@bilousd/angular-wysiwyg-editor-lib';
import { SearchPageComponent } from './search-page.component';
import {ShelterCommonModule} from './common';
import { MenuPageComponent } from './menu-page.component';
import {BasicService} from './basic.service';
import { TestDynamicComponent } from './test-dynamic.component';
// import {Overlay, OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
// import {CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER} from "@angular/cdk/overlay/overlay-directives";

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        TopMenuPageComponent,
        SubMenuPageComponent,
        SearchPageComponent,
        MenuPageComponent,
        TestDynamicComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    UiLibModule,
    HttpClientModule,
    FormsModule,
    ScrollingModule,
    AngularWysiwygEditorLibModule,
    ShelterCommonModule,
    SharedModule,
    ControlsModule,
    UiElementsModule,
    LoggerModule,
    DialogServiceModule,
  ],
    providers: [
      {provide: 'ObtainSystemLanguage', useClass: BasicService},
      // MAT_DIALOG_SCROLL_STRATEGY_PROVIDER,
      // {provide: DIALOG_REF, useValue: DialogRef},
      // {provide: DIALOG_CONTAINER, useValue: CdkDialogContainer},
      // {provide: DIALOG_CONFIG, useValue: DialogConfig},
      // Overlay,
      // CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
