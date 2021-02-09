import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {BaseComponent} from './base.component';
import {SystemLang} from '../i18n';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TitleType} from '../shared';

export const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputControlComponent),
  multi: true
};
export interface InputParameters {
  tooltip?: string | TitleType[];
  placeholder?: string | TitleType[];
  leadingIcon?: string;
  trailingIcon?: string;
  // Bind Element property
  type?: string;
  accessKey?: string;
  formTarget?: string;
  formAction?: string;
  formNoValidate?: boolean;
  formMethod?: string;
  formEnctype?: string;
  autofocus?: boolean;
  tabIndex?: number;
}
@Component({
  selector: 'lib-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss'],
  providers: [INPUT_VALUE_ACCESSOR]
})
export class InputControlComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  // tslint:disable-next-line:variable-name
  private _extraParams: InputParameters = {};
  @Input()
  set extraParams(p: InputParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): InputParameters {
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
  // Bind Element property
  @Input()
  get type(): string {
    return this.extraParams.type || 'text';
  }
  set type(p: string) {
    this.extraParams.type = p;
  }
  @Input()
  set accessKey(p: string) {
    this.extraParams.accessKey = p;
  }
  get accessKey(): string {
    return this.extraParams.accessKey || null;
  }
  @Input()
  set formTarget(p: string) {
    this.extraParams.formTarget = p;
  }
  get formTarget(): string {
    return this.extraParams.formTarget || null;
  }
  @Input()
  set formAction(p: string) {
    this.extraParams.formAction = p;
  }
  get formAction(): string {
    return this.extraParams.formAction || null;
  }
  @Input()
  set formNoValidate(p: boolean) {
    this.extraParams.formNoValidate = p;
  }
  get formNoValidate(): boolean {
    return this.extraParams.formNoValidate || null;
  }
  @Input()
  set formMethod(p: string) {
    this.extraParams.formMethod = p;
  }
  get formMethod(): string {
    return this.extraParams.formMethod || null;
  }
  @Input()
  set formEnctype(p: string) {
    this.extraParams.formEnctype = p;
  }
  get formEnctype(): string {
    return this.extraParams.formEnctype;
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

  constructor(public systemLang: SystemLang) {
    super(systemLang);
    console.log('lib-input-constructor');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
    this.pError = this.doIfNeedI18n(this.error);
    this.iconsClass = {};
    if (this.leadingIcon) {
      this.iconsClass['gm-' + this.leadingIcon] = true;
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
    this.value = (obj !== undefined && isNaN(obj) && typeof obj !== 'object') ? obj.toString() : null;
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
