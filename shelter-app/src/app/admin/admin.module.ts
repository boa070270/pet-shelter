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
import {ControlsModule, DialogServiceModule, WysiwygModule} from 'ui-lib';
import {ShelterCommonModule} from '../common';
import {FormsModule} from '@angular/forms';
import { TestSyncComponent } from './test-sync.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { DsComponent } from './ds.component';
import { DsDataComponent } from './ds-data.component';

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
    TestSyncComponent,
    DsComponent,
    DsDataComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    WysiwygModule,
    ShelterCommonModule,
    FormsModule,
    ControlsModule,
    FormsModule,
    DialogServiceModule,
    DragDropModule
  ]
})
export class AdminModule { }
