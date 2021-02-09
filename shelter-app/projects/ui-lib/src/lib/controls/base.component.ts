import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { SystemLang } from '../i18n';
import {Subscription} from 'rxjs';
import {distinctTitleId, isTitleType, TitleType} from '../shared';
import {ControlValueAccessor} from '@angular/forms';

export interface CommonParameters {
  id?: string;
  name?: string;
  hint?: string | TitleType[];
  error?: string | TitleType[];
  dir?: string;
  caption?: string | TitleType[];
  hidden?: boolean;
  disabled?: boolean;
  required?: boolean;
}
@Component({
  selector: 'lib-base',
  template: ''
})
export class BaseComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  // tslint:disable-next-line:variable-name
  private _commons = {};
  @Input()
  set common(p: CommonParameters) {
    this._commons = p || {};
  }
  get common(): CommonParameters {
    if (!this._commons) {
      this._commons = {};
    }
    return this._commons;
  }
  @Input()
  set id(p: string) {
    this.common.id = p;
  }
  get id(): string {
    return this.common.id || null;
  }
  @Input()
  set name(p: string){
    this.common.name = p;
  }
  get name(): string {
    return this.common.name || null;
  }
  @Input()
  set hint(p: string | TitleType[]) {
    this.common.hint = p;
  }
  get hint(): string | TitleType[] {
    return this.common.hint || null;
  }
  @Input()
  set error(p: string | TitleType[]) {
    this.common.error = p;
  }
  get error(): string | TitleType[] {
    return this.common.error;
  }
  @Input()
  set dir(p: string) {
    this.common.dir = p;
  }
  get dir(): string {
    return this.common.dir || null;
  }
  @Input()
  set caption(p: string | TitleType[]) {
    this.common.caption = p;
  }
  get caption(): string | TitleType[] {
    return this.common.caption;
  }
  @Input()
  set hidden(p: boolean) {
    this.common.hidden = p;
  }
  get hidden(): boolean {
    return this.common.hidden || null;
  }
  @Input()
  set disabled(p: boolean) {
    this.common.disabled = p;
  }
  get disabled(): boolean {
    return this.common.disabled;
  }
  @Input()
  set required(p: boolean) {
    this.common.required = p;
  }
  get required(): boolean {
    return this.common.required;
  }

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

  needI18n(what: any): boolean {
    return (typeof what === 'object' !== null) && (isTitleType(what) || (Array.isArray(what) && isTitleType(what[0])));
  }
  protected emitChange(value: any): void {
    console.log('BaseControlComponent.emitChange', this, value);
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
  registerOnChange(fn: any): void {
    this.change = fn;
  }
  registerOnTouched(fn: any): void {
    this.touch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
  }

}
