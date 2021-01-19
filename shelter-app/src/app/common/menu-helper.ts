import {MenusAndTitlesType, MenuTree} from './types';
import {SystemLang} from 'ui-lib';

export class MenuHelper {
  constructor(private menu: MenusAndTitlesType, private lang: SystemLang){
  }
  _findParent(tree: MenuTree[], path): MenuTree {
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
  menuTree(locale: string): MenuTree[] {
    if (!locale) {
      locale = this.lang.getLocale();
    }
    const result: MenuTree[] = [];
    for (const m of this.menu.menus) {
      let menuTree: MenuTree  = this._findParent(result, m.path);
      if (menuTree) {
        menuTree.component = m.component;
        menuTree.role = m.role;
      } else {
        menuTree = {
          path: m.path,
          component: m.component,
          title: this._getTitle(m.path, locale, this.lang),
          role: m.role
        };
      }
      if (m.parentId) {
        let parent = this._findParent(result, m.parentId);
        if (!parent) {
          parent = {
            path: m.parentId,
            component: null,
            title: this._getTitle(m.parentId, locale, this.lang)
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
  _getTitle(path: string, locale: string, lang: SystemLang): string {
    const titles = this.menu.titles.filter(v => v.id === path);
    const title = titles.find(v => v.lang === locale);
    if (title) {
      return title.title;
    }
    return lang.getTitle(titles);
  }
}
