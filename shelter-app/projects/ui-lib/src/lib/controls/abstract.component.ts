import {Component, Inject, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {SystemLang} from '../i18n';
import {distinctTitleId, I18NType, isTitleType, TitleType} from '../shared';

@Component({
  selector: 'lib-abstract',
  template: '',
  providers: [{provide: 'i18NCfg', useValue: null}]
})
export class AbstractComponent implements OnDestroy {
  private subs: Subscription;
  i18n: any;
  constructor(public systemLang: SystemLang,
              @Inject('i18NCfg') public i18NCfg?: I18NType) {
    this.subs = this.systemLang.onChange().subscribe( l => {
      if (typeof l === 'string') {
        this.onChangeLang();
      }
    });
    this.i18n = this.systemLang.i18n(this.i18NCfg);
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

}
