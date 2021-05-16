import {Inject, NgModule} from '@angular/core';
import {Route, Router, RouterModule, Routes} from '@angular/router';
import {SYSTEM_LANG_TOKEN, SystemLang} from 'ui-lib';
import {MenuTree} from './common';
import {SubMenuPageComponent} from './sub-menu-page/sub-menu-page.component';
import {TopMenuPageComponent} from './top-menu-page.component';
import {MainPageComponent} from './main-page.component';
import {PageComponent} from './common';
import {PetComponent} from './common';
import {SearchPageComponent} from './search-page.component';
import {MenuPageComponent} from './menu-page.component';
import {SystemMenuService} from './system-menu.service';
import {TestDynamicComponent} from './test-dynamic.component';
import {TestEditorComponent} from './test-editor.component';
import {TestSyncComponent} from './admin/test-sync.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'page/:id', component: PageComponent },
  { path: 'pet/:id', component: PetComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'test-dynamic', component: TestDynamicComponent},
  { path: 'test-editor', component: TestEditorComponent},
  { path: 'test-sync', component: TestSyncComponent},
  { path: 'test', component: TopMenuPageComponent},
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
];
const KnownComponents = {
  TopMenuPageComponent, // TODO remove this
  SubMenuPage: SubMenuPageComponent,
  MenuPage: MenuPageComponent
};
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private systemMenu: SystemMenuService, @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang, private router: Router) {
    console.log('Constructor AppRoutingModule');
    this.systemMenu.observable.subscribe(() => {
      const menuTree = this.systemMenu.menuTree();
      const routers: Routes = [];
      for (const menu of menuTree) {
        if (menu.path === 'admin') {
          continue;
        }
        const r = this.makeRoute(menu);
        routers.push(r);
      }
      for (const route of routes) {
        routers.push(route);
      }
      console.log('AppRoutingModule.constructor', routers);
      this.router.resetConfig(routers);
    });
  }
  private makeRoute(m: MenuTree): Route {
    const r: Route = {path: m.path, component: KnownComponents[m.component]};
    if (m.menu && m.menu.length > 0) {
      r.children = m.menu.map(ch => this.makeRoute(ch));
      // r.children.unshift({path: '', component: KnownComponents[m.component]});
    }
    return r;
  }
}
