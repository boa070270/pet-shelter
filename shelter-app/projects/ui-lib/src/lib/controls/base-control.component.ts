import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { SystemLang } from '../i18n';
import {Subscription} from 'rxjs';
import {isTitleType, TitleType} from '../shared';

@Component({
  selector: 'lib-base-control',
  template: ''
})
export class BaseControlComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hint: string | TitleType[];
  @Input() dir: string;
  pHint: string;
  private subs: Subscription;

  constructor(public systemLang: SystemLang) {
    this.subs = systemLang.onChange().subscribe(l => {
      if (typeof l === 'string') {
        this.onChangeLang();
      }
    });
  }


  ngOnInit(): void {
    this.pHint = this.doIfNeedI18n(this.hint);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hint) {
      this.pHint = this.doIfNeedI18n(this.hint);
    }
  }
  ngOnDestroy(): void {
      this.subs.unsubscribe();
  }
  onChangeLang(): void {
    this.pHint = this.doIfNeedI18n(this.hint);
  }

  doIfNeedI18n(what: string | TitleType[]): string {
    return this.needI18n(what) ? this.systemLang.getTitle(what as TitleType[]) : what as string;
  }

  needI18n(fld): boolean {
    return (typeof fld === 'object' !== null) && (isTitleType(fld) || (Array.isArray(fld) && isTitleType(fld[0])));
  }

}
