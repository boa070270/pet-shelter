import {NgModule} from '@angular/core';
import {Route, Router, RouterModule, Routes} from '@angular/router';
import {SystemLang} from 'ui-lib';
import {MenuTree} from './common/types';
import {SubMenuPageComponent} from './sub-menu-page/sub-menu-page.component';
import {TopMenuPageComponent} from './top-menu-page.component';
import {MainPageComponent} from './main-page.component';
import {PageComponent} from './common/page.component';
import {PetComponent} from './common/pet.component';
import {SearchPageComponent} from './search-page.component';
import {MenuPageComponent} from './menu-page.component';
import {SystemMenuService} from './system-menu.service';
import {LoginPageComponent} from './login-page.component';
import {TestDynamicComponent} from './test-dynamic.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'login', component: LoginPageComponent},
  { path: 'page/:id', component: PageComponent },
  { path: 'pet/:id', component: PetComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'test-dynamic', component: TestDynamicComponent},
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
  constructor(private systemMenu: SystemMenuService, private systemLang: SystemLang, private router: Router) {
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
