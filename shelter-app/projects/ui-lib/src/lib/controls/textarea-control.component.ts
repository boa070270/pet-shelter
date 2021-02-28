import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BaseComponent} from './base.component';
import {TitleType} from '../shared';

export interface TextareaParameters {
  tooltip?: string | TitleType[];
  placeholder?: string | TitleType[];
  leadingIcon?: string;
  trailingIcon?: string;
  // Bind Element property
  accessKey?: string;
  autofocus?: boolean;
  tabIndex?: number;
}
export const TEXTAREA_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextareaControlComponent),
  multi: true
};
@Component({
  selector: 'lib-textarea-control',
  templateUrl: './textarea-control.component.html',
  styleUrls: ['./input-control.component.scss'],
  providers: [TEXTAREA_VALUE_ACCESSOR]
})
export class TextareaControlComponent extends BaseComponent implements  OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  // tslint:disable-next-line:variable-name
  protected _extraParams: TextareaParameters = {};
  @Input()
  set extraParams(p: TextareaParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): TextareaParameters {
    if (!this._extraParams) {
      this._extraParams = {};
    }
    return this._extraParams;
  }
  @Input()
  set tooltip(p: string | TitleType[]) {
    this.extraParams.tooltip = p;
  }
  get tooltip(): string | TitleType[] {
    return this.extraParams.tooltip || null;
  }
  @Input()
  set placeholder(p: string | TitleType[]) {
    this.extraParams.placeholder = p;
  }
  get placeholder(): string | TitleType[] {
    return this.extraParams.placeholder || null;
  }
  @Input()
  set leadingIcon(p: string) {
    this.extraParams.leadingIcon = p;
  }
  get leadingIcon(): string {
    return this.extraParams.leadingIcon || null;
  }
  @Input()
  set trailingIcon(p: string) {
    this.extraParams.trailingIcon = p;
  }
  get trailingIcon(): string {
    return this.extraParams.trailingIcon || null;
  }
  @Input()
  set accessKey(p: string) {
    this.extraParams.accessKey = p;
  }
  get accessKey(): string {
    return this.extraParams.accessKey || null;
  }
  @Input()
  set autofocus(p: boolean) {
    this.extraParams.autofocus = p;
  }
  get autofocus(): boolean {
    return this.extraParams.autofocus;
  }
  @Input()
  set tabIndex(p: number) {
    this.extraParams.tabIndex = p;
  }
  get tabIndex(): number {
    return this.extraParams.tabIndex || null;
  }
  value: string;
  pTooltip: string;
  pPlaceholder: string;
  iconsClass: any;


  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
    this.iconsClass = {};
    if (this.leadingIcon) {
      this.iconsClass[this.leadingIcon] = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('InputControlComponent.ngOnChanges', changes);
    super.ngOnChanges(changes);
    if (changes.tooltip) {
      this.pTooltip = this.doIfNeedI18n(this.tooltip);
    }
    if (changes.placeholder) {
      this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
  }
  writeValue(obj: any): void {
    console.log('InputControlComponent.writeValue', obj);
    this.value = obj;
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
    console.log('InputControlComponent.setDisabledState', isDisabled);
  }
  onChange($event: Event): void {
    if (typeof this.change === 'function') {
      console.log('InputControlComponent.onChange(this.value)');
      this.change(this.value);
    }
  }
  onBlur(): void {
    if (typeof this.touch === 'function') {
      this.touch();
    }
  }

}
