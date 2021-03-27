import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {LangTableComponent} from './lang-table.component';
import {MenuTableComponent} from './menu-table.component';
import {FieldsTableComponent} from './fields-table.component';
import {FilesTableComponent} from './files-table.component';
import {PetsTableComponent} from './pets-table.component';
import {BannersTableComponent} from './banners-table.component';
import {PageTableComponent} from './page-table.component';
import {UserTableComponent} from './user-table.component';
import {ControlsModule, UiLibModule, DialogServiceModule, AngularWysiwygEditorLibModule} from 'ui-lib';
import {ShelterCommonModule} from '../common';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    LangTableComponent,
    MenuTableComponent,
    FieldsTableComponent,
    FilesTableComponent,
    PetsTableComponent,
    BannersTableComponent,
    PageTableComponent,
    UserTableComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    UiLibModule,
    FormsModule,
    AngularWysiwygEditorLibModule,
    ShelterCommonModule,
    FormsModule,
    ControlsModule,
    FormsModule,
    DialogServiceModule
  ]
})
export class AdminModule { }
