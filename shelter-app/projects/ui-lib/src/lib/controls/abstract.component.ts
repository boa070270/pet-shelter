import {Component, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  distinctTitleId,
  I18N_CFG,
  I18NType,
  isTitleType,
  ROOT_PAGE_DATA,
  RootPageService,
  SYSTEM_LANG_TOKEN,
  SystemLang,
  TitleType
} from '../shared';

@Component({
  selector: 'lib-abstract',
  template: ''
})
export class AbstractComponent implements OnDestroy, OnChanges {
  private subs: Subscription;
  i18n: any;
  public systemLang: SystemLang;
  protected rootPage: RootPageService;
  public i18NCfg?: I18NType;

  constructor(protected _view: ViewContainerRef) {
    this.systemLang = _view.injector.get(SYSTEM_LANG_TOKEN);
    this.i18NCfg = _view.injector.get(I18N_CFG, null);
    this.rootPage = _view.injector.get(ROOT_PAGE_DATA, null);
    this.subs = this.systemLang.onChange().subscribe( l => {
      if (typeof l === 'string') {
        this.onChangeLang();
      }
    });
    this.i18n = this.systemLang.i18n(this.i18NCfg);
  }
  static isPageData(s: any): boolean {
    return typeof s === 'string' && s.startsWith('{{') && s.endsWith('}}');
  }
  static pageDataKey(s: string): string {
    return s.replace(/{{|}}/g, '');
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected onChangeLang(): void {
    this.i18n = this.systemLang.i18n(this.i18NCfg);
  }
  /**
   * Take a lang specific title if "what" is TitleType or TitleType[]
   * @param what: expected "string" | TitleType[]
   * @param holder - represent object where would be stored titles as id:title
   */
  protected doIfNeedI18n(what: any, holder?: {}): any {
    if (typeof what === 'string') {
      if (holder) {
        holder[what] = what;
      } else {
        return what || '';
      }
    } else if (this.needI18n(what)) {
      if (holder) {
        const ids = distinctTitleId(what);
        for (const id of ids) {
          const titles = (what as TitleType[]).filter(t => t.id = id);
          holder[id] = this.systemLang.getTitle(titles);
        }
      } else {
        return this.systemLang.getTitle(what as TitleType[]);
      }
    }
    return holder || '';
  }

  protected needI18n(what: any): boolean {
    return (typeof what === 'object' !== null) && (isTitleType(what) || (Array.isArray(what) && isTitleType(what[0])));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('BaseControlComponent.ngOnChanges', this, changes);
    Object.keys(changes).forEach(k => {
      const v = changes[k].currentValue;
      if (this.rootPage && AbstractComponent.isPageData(v)) {
        const d = this.rootPage.getData(AbstractComponent.pageDataKey(v));
        if (d) {
          this[k] = changes[k].currentValue = d;
        }
      }
    });
    if (changes.name) {
      console.log('BaseControlComponent.ngOnChanges was changed name', changes);
    }
  }
}
