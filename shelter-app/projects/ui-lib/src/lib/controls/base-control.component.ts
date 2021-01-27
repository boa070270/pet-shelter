import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { SystemLang } from '../i18n';
import {Subscription} from 'rxjs';
import {distinctTitleId, isTitleType, TitleType} from '../shared';

@Component({
  selector: 'lib-base-control',
  template: ''
})
export class BaseControlComponent implements OnInit, OnDestroy, OnChanges {
  @Input() id: string;
  @Input() name: string;
  @Input() hint: string | TitleType[];
  @Input() error: string | TitleType[];
  @Input() dir: string;
  @Input() caption: string | TitleType[];
  pHint: string;
  pCaption: string;
  pError: string;
  private subs: Subscription;
  protected change: (_: any) => {};
  protected touch: () => {};

  constructor(public systemLang: SystemLang) {
    this.subs = systemLang.onChange().subscribe(l => {
      if (typeof l === 'string') {
        this.onChangeLang();
      }
    });
  }


  ngOnInit(): void {
    this.pCaption = this.doIfNeedI18n(this.caption);
    this.pHint = this.doIfNeedI18n(this.hint) as string;
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('BaseControlComponent.ngOnChanges', this, changes);
    if (changes.name) {
      console.log('BaseControlComponent.ngOnChanges was changed name');
    }
    if (changes.hint) {
      this.pHint = this.doIfNeedI18n(this.hint) as string;
    }
    if (changes.caption) {
      this.pCaption = this.doIfNeedI18n(this.caption);
    }
    if (changes.error) {
      this.pError = this.doIfNeedI18n(this.error);
    }
  }
  ngOnDestroy(): void {
      this.subs.unsubscribe();
  }
  onChangeLang(): void {
    this.pHint = this.doIfNeedI18n(this.hint) as string;
    this.pCaption = this.doIfNeedI18n(this.caption);
    this.pError = this.doIfNeedI18n(this.error);
  }

  /**
   * Take a lang specific title if "what" is TitleType or TitleType[]
   * @param what: expected "string" | TitleType[]
   * @param holder - represent object where would be stored titles as id:title
   */
  doIfNeedI18n(what: any, holder?: {}): any {
    if (typeof what === 'string') {
      if (holder) {
        holder[what] = what;
      } else {
        return what;
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
    return holder;
  }

  needI18n(what: any): boolean {
    return (typeof what === 'object' !== null) && (isTitleType(what) || (Array.isArray(what) && isTitleType(what[0])));
  }
  protected emitChange(value: any): void {
    console.log('BaseControlComponent.emitChange', this);
    if (typeof this.change === 'function') {
      this.change(value);
    }
  }
  onBlur(): void {
    console.log('BaseControlComponent.onBlur', this);
    if (typeof this.touch === 'function') {
      this.touch();
    }
  }

}
