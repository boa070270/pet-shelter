import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {RootPageService, TitleType} from '../shared';
import {ControlValueAccessor} from '@angular/forms';
import {Directionality} from '@angular/cdk/bidi';
import {AbstractComponent} from './abstract.component';

export interface CommonParameters {
  id?: string;
  name?: string;
  hint?: string | TitleType[];
  error?: Array<string | TitleType>;
  caption?: string | TitleType[];
  hidden?: boolean;
  disabled?: boolean;
  required?: boolean;
  nameAsCaption?: boolean;
}
@Component({
  selector: 'lib-base',
  template: '',
  providers: [{provide: 'i18NCfg', useValue: null}]
})
export class BaseComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {

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
    this.pHint = this.doIfNeedI18n(p) as string;
  }
  @Input()
  set error(p: Array<string | TitleType>) {
    this.common.error = p;
    const err = this.doIfNeedI18n(p, {});
    this.pError = err ? Object.values(err) : null;
  }
  @Input()
  set caption(p: string | TitleType[]) {
    this.common.caption = p;
    this.pCaption = this.doIfNeedI18n(this.common.caption);
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
  dir: string;
  pHint: string;
  pCaption: string;
  pError: string[];
  private subsDir: Subscription;
  protected change: (_: any) => {};
  protected touch: () => {};
  protected directionality: Directionality;
  protected rootPage: RootPageService;

  constructor(protected _view: ViewContainerRef) {
    super(_view);
    this.directionality = this._view.injector.get(Directionality, null);
    if (this.directionality) {
      this.dir = this.directionality.value;
      this.subsDir = this.directionality.change.subscribe(d => {
        this.dir = d;
      });
    }
  }


  ngOnInit(): void {
    this.onChangeLang();
    if (!this.pCaption && this.common.nameAsCaption) {
      this.pCaption = this.name;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes.name) {
      console.log('BaseControlComponent.ngOnChanges was changed name', changes);
    }
  }
  ngOnDestroy(): void {
      this.subsDir.unsubscribe();
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.pHint = this.doIfNeedI18n(this.common.hint) as string;
    this.pCaption = this.doIfNeedI18n(this.common.caption);
    const err = this.doIfNeedI18n(this.common.error, {});
    this.pError = err ? Object.values(err) : null;
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
