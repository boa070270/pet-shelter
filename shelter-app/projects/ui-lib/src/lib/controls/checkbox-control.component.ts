import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {BaseComponent} from './base.component';
import {TitleType} from '../shared';
import {Directionality} from '@angular/cdk/bidi';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxControlComponent),
  multi: true
};

export type CheckboxDirection = 'row' | 'col' | 'grid';
export interface CheckboxParameters {
  direction?: CheckboxDirection;
  cols?: number;
  options?: any[];
  titles?: {[key: string]: string} | TitleType[];
  optionAsTitle?: boolean;
  tooltips?: string[] | TitleType[];
  indeterminate?: boolean;
  multiple?: boolean;
}
@Component({
  selector: 'lib-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class CheckboxControlComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  private _extraParams: CheckboxParameters = {};
  @Input()
  set extraParams(p: CheckboxParameters) {
    this._extraParams = p || {};
  }
  get extraParams(): CheckboxParameters {
    if (!this._extraParams) {
      this._extraParams = {};
    }
    return this._extraParams;
  }
  @Input()
  set direction(p: CheckboxDirection) {
    this.extraParams.direction = p;
  }
  get direction(): CheckboxDirection {
    return this.extraParams.direction || 'col';
  }
  @Input()
  set cols(p: number) {
    this.extraParams.cols = p;
  }
  get cols(): number {
    return this.extraParams.cols || null;
  }
  @Input()
  set options(p: any[]) {
    this.extraParams.options = p;
  }
  get options(): any[] {
    if (!this.extraParams.options) {
      this.extraParams.options = [];
    }
    return this.extraParams.options;
  }
  @Input()
  set titles(p: {[key: string]: string} | TitleType[]) {
    this.extraParams.titles = p;
  }
  get titles(): {[key: string]: string} | TitleType[] {
    return this.extraParams.titles || null;
  }
  @Input()
  set optionAsTitle(p: boolean) {
    this.extraParams.optionAsTitle = p;
  }
  get optionAsTitle(): boolean {
    return this.extraParams.optionAsTitle || true;
  }
  @Input()
  set tooltips(p: string[] | TitleType[]) {
    this.extraParams.tooltips = p;
  }
  get tooltips(): string[] | TitleType[] {
    return this.extraParams.tooltips || null;
  }
  @Input()
  set indeterminate(p: boolean) {
    this.extraParams.indeterminate = p;
  }
  get indeterminate(): boolean {
    return this.extraParams.indeterminate || null;
  }
  values: {[key: string]: any} = {};
  pTitles: {[id: string]: string};
  tips: {[id: string]: string};

  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.clearAll();
    this.pTitles =  this.doIfNeedI18n(this.titles, {}) as any;
    this.tips = this.doIfNeedI18n(this.tooltips, {});
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.labels) {
      this.pTitles =  this.doIfNeedI18n(this.titles, {});
    }
    if (changes.tooltips) {
      this.tips = this.doIfNeedI18n(this.tooltips, {});
    }
    super.ngOnChanges(changes);
  }
  onChangeLang(): void {
    this.pTitles =  this.doIfNeedI18n(this.titles, {});
    this.tips = this.doIfNeedI18n(this.tooltips, {});
    super.onChangeLang();
  }

  writeValue(obj: any): void {
    console.log('CheckboxControlComponent.writeValue', obj);
    this.clearAll();
    if (obj !== null && obj !== undefined) {
      if (Array.isArray(obj)) {
        this.setArray(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        this.setObject(obj);
      } else {
        this.setValue(obj, true);
      }
    }
  }
  onChange($event: Event): void {
    const target: HTMLInputElement = $event.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT') {
      this.toggle(target.value);
      this.emitChange(this.getArrayValues());
    }
  }
  setValue(key: any, value: any): void {
    if (this.options.includes(key)) {
      this.values[key] = value;
      this.values = Object.assign({}, this.values);
    }
  }
  getValue(key: any): any {
    return this.values[key];
  }
  protected clearValue(key: any): void {
    this.values[key] = null;
  }
  protected toggle(key: any): void {
    this.values[key] = !this.values[key];
  }
  setObject(obj: any): void {
    Object.keys(obj).forEach(k => this.values[k] = this.options.includes(k));
    this.values = Object.assign({}, this.values);
  }
  setArray(opt: Array<string>): void {
    opt.forEach(o => this.values[o] = this.options.includes(o));
    this.values = Object.assign({}, this.values);
  }
  getArrayValues(): any[] {
    return this.options.filter(o => this.values[o] !== null && this.values[o] !== undefined);
  }
  clearAll(): void {
    this.values = {};
    this.options.forEach(o => this.values[o] = null);
  }
}
