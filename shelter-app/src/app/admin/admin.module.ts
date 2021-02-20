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
import {FormsModule, UiLibModule} from 'ui-lib';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AngularWysiwygEditorLibModule} from '@bilousd/angular-wysiwyg-editor-lib';
import {MatExpansionModule} from '@angular/material/expansion';
import {ShelterCommonModule} from '../common/common.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule as MatFormsModule} from '@angular/forms';
import {ControlsModule} from 'ui-lib';


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
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        AngularWysiwygEditorLibModule,
        MatExpansionModule,
        ShelterCommonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatFormsModule,
        ControlsModule
    ]
})
export class AdminModule { }
