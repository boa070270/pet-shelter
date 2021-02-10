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
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from './menu.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AngularWysiwygEditorLibModule} from '@bilousd/angular-wysiwyg-editor-lib';
import { SearchPageComponent } from './search-page.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ShelterCommonModule} from './common/common.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MenuPageComponent } from './menu-page.component';
import { LoginPageComponent } from './login-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {BasicService} from './basic.service';
import { TestDynamicComponent } from './test-dynamic.component';

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        TopMenuPageComponent,
        SubMenuPageComponent,
        MenuComponent,
        SearchPageComponent,
        MenuPageComponent,
        LoginPageComponent,
        TestDynamicComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    UiLibModule,
    HttpClientModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    ScrollingModule,
    AngularWysiwygEditorLibModule,
    MatButtonToggleModule,
    ShelterCommonModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    SurveyModule,
    SharedModule,
    ControlsModule,
    SwaggerFormModule,
    UiElementsModule,
    DialogsModule,
  ],
    providers: [
      {provide: 'ObtainSystemLanguage', useClass: BasicService},
      ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
