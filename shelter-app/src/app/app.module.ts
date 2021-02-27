import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {
  SurveyModule,
  UiLibModule,
  SharedModule,
  ControlsModule,
  ObtainSystemLanguage,
  SwaggerFormModule,
  UiElementsModule,
  DialogsModule
} from 'ui-lib';
import {HttpClientModule} from '@angular/common/http';
import { MainPageComponent } from './main-page.component';
import { TopMenuPageComponent } from './top-menu-page.component';
import { SubMenuPageComponent } from './sub-menu-page/sub-menu-page.component';
import {FormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AngularWysiwygEditorLibModule} from '@bilousd/angular-wysiwyg-editor-lib';
import { SearchPageComponent } from './search-page.component';
import {ShelterCommonModule} from './common/common.module';
import { MenuPageComponent } from './menu-page.component';
import {BasicService} from './basic.service';
import { TestDynamicComponent } from './test-dynamic.component';
import {OverlayModule} from '@angular/cdk/overlay';

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
    SurveyModule,
    SharedModule,
    ControlsModule,
    SwaggerFormModule,
    UiElementsModule,
    DialogsModule,
    OverlayModule
  ],
    providers: [
      {provide: 'ObtainSystemLanguage', useClass: BasicService},
      ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
