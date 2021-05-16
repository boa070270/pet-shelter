import {Inject, Injectable, OnDestroy} from '@angular/core';
import {BasicService} from './basic.service';
import {BROWSER_STORAGE, BrowserStorageService, StorageService, SYSTEM_LANG_TOKEN} from 'ui-lib';
import {AdminMenu, MenusAndTitlesType, MenuTree, MenuType} from './common/types';
import {BehaviorSubject, Observable} from 'rxjs';
import {SystemLang} from 'ui-lib';
import {Routes} from '@angular/router';

const KEY_SYSTEM_MENU = 'SystemMenu';
@Injectable({
  providedIn: 'root'
})
export class SystemMenuService implements OnDestroy {
  private readonly subject: BehaviorSubject<MenusAndTitlesType>;
  private routes: Routes = [];
  private menuTitles: MenuTree[];
  get observable(): Observable<MenusAndTitlesType> {
    return this.subject;
  }
  get menusAndTitle(): MenusAndTitlesType {
    return this.subject.getValue();
  }
  set menusAndTitle(m: MenusAndTitlesType) {
    this.subject.next(m);
    this.storage.setObj(KEY_SYSTEM_MENU, m);
  }
  constructor(private service: BasicService,
              @Inject(BROWSER_STORAGE) private storage: StorageService, @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang
  ) {
    console.log('constructor SystemMenuService');
    const menu = this.storage.getObj(KEY_SYSTEM_MENU);
    this.subject = new BehaviorSubject(menu || {menus: [], titles: []});
    this.refresh();
  }
  refresh(): void {
    console.log('refresh SystemMenuService');
    this.service.getMenus().subscribe(d => {
      for (const m of AdminMenu.menus) {
        d.menus.push(m);
      }
      for (const t of AdminMenu.titles) {
        d.titles.push(t);
      }
      this.menusAndTitle = d;
    });
  }
  ngOnDestroy(): void {
    console.log('destroy SystemMenuService');
    if (!this.subject.isStopped) {
      this.subject.complete();
    }
  }
  private _findParent(tree: MenuTree[], path): MenuTree {
    for (const m of tree) {
      if (m.path === path) {
        return m;
      } else if (m.menu && m.menu.length > 0) {
        const found = this._findParent(m.menu, path);
        if (found) {
          return found;
        }
      }
    }
  }
  menuChildren(menuTree: MenuTree): void {
    const children = this.menusAndTitle.menus.filter(m => m.parentId === menuTree.path)
      .map(m => ({path: m.path, component: m.component, role: m.role, title: this.menusAndTitle.titles.filter(t => t.id === m.path)}));
    if (children.length > 0) {
      children.forEach(c => this.menuChildren(c));
      menuTree.menu = children;
    }
  }
  menuTree(locale?: string): MenuTree[] {
    const result: MenuTree[] = this.menusAndTitle.menus.filter(m => !m.parentId)
      .map(m => ({path: m.path, component: m.component, role: m.role, title: this.menusAndTitle.titles.filter(t => t.id === m.path)}));
    result.forEach(c => this.menuChildren(c));
    return result;
  }
  getMenu(url: string, menusAndTitles?: MenusAndTitlesType): MenuType {
    const menus = menusAndTitles || this.menusAndTitle;
    const paths = url.split('/');
    const path = paths[paths.length - 1];
    if (path) {
      return (menusAndTitles || this.menusAndTitle).menus.find(v => v.path === path);
    }
  }
}
