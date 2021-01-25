import {Injectable, OnDestroy} from '@angular/core';
import {BasicService} from './basic.service';
import {BrowserStorageService} from 'ui-lib';
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
              private storage: BrowserStorageService, private systemLang: SystemLang
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
  menuTree(locale?: string): MenuTree[] {
    const result: MenuTree[] = [];
    result.push({path: 'test', title: 'Test', component: 'TopMenuPageComponent'}); // TODO remove this
    const menusAndTitles = this.menusAndTitle;
    for (const m of menusAndTitles.menus) {
      let menuTree: MenuTree  = this._findParent(result, m.path);
      if (menuTree) {
        menuTree.component = m.component;
        menuTree.role = m.role;
      } else {
        menuTree = {
          path: m.path,
          component: m.component,
          title: this.getTitle(m.path, locale, menusAndTitles),
          role: m.role
        };
      }
      if (m.parentId) {
        let parent = this._findParent(result, m.parentId);
        if (!parent) {
          parent = {
            path: m.parentId,
            component: null,
            title: this.getTitle(m.parentId, locale, menusAndTitles)
          };
          result.push(parent);
        }
        if (!parent.menu) {
          parent.menu = [];
        }
        parent.menu.push(menuTree);
      } else {
        result.push(menuTree);
      }
    }
    return result;
  }
  getTitle(path: string, locale?: string, menusAndTitles?: MenusAndTitlesType): string {
    const titles = (menusAndTitles || this.menusAndTitle).titles.filter(v => v.id === path);
    if (titles) {
      if (locale) {
        const title = titles.find(v => v.lang === locale);
        if (title) {
          return title.title;
        }
      }
      return this.systemLang.getTitle(titles);
    }
    return path;
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
