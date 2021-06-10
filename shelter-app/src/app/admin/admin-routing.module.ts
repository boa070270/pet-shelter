import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LangTableComponent} from './lang-table.component';
import {MenuTableComponent} from './menu-table.component';
import {FieldsTableComponent} from './fields-table.component';
import {FilesTableComponent} from './files-table.component';
import {PetsTableComponent} from './pets-table.component';
import {BannersTableComponent} from './banners-table.component';
import {PageTableComponent} from './page-table.component';
import {UserTableComponent} from './user-table.component';
import { AdminComponent } from './admin.component';
import {AuthGuard} from '../auth.guard';
import {DsComponent} from "./ds.component";
import {DsDataComponent} from "./ds-data.component";

const routes: Routes = [
  {path: 'lang-table', component: LangTableComponent, canActivate: [AuthGuard]},
  {path: 'menu-table', component: MenuTableComponent, canActivate: [AuthGuard]},
  {path: 'fields-table', component: FieldsTableComponent, canActivate: [AuthGuard]},
  {path: 'files-table', component: FilesTableComponent, canActivate: [AuthGuard]},
  {path: 'pets-table', component: PetsTableComponent, canActivate: [AuthGuard]},
  {path: 'banners-table', component: BannersTableComponent, canActivate: [AuthGuard]},
  {path: 'page-table', component: PageTableComponent, canActivate: [AuthGuard]},
  {path: 'user-table', component: UserTableComponent, canActivate: [AuthGuard]},
  {path: 'ds', component: DsComponent, canActivate: [AuthGuard]},
  {path: 'ds-data', component: DsDataComponent, canActivate: [AuthGuard]},
  { path: '', component: AdminComponent }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
