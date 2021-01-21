import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {BaseControlComponent} from './base-control.component';
import {TitleType} from '../shared';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxControlComponent),
  multi: true
};

@Component({
  selector: 'lib-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class CheckboxControlComponent extends BaseControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() name: any;
  @Input() direction: 'row' | 'col' | 'grid' = 'col';
  @Input() cols: number;
  @Input() options: string[];
  @Input() titles: string[] | TitleType[];
  @Input() tooltips: string[] | TitleType[];
  @Input() values: string[] = [];
  pTitles: string[] = [];
  tips: string[] = [];
  disabled: boolean;
  change: (_: any) => {};
  touch: () => {};

  constructor(public systemLang: SystemLang) {
    super(systemLang);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.pTitles =  this.doI18n(this.titles);
    this.tips = this.doI18n(this.tooltips);
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.labels) {
      this.pTitles =  this.doI18n(this.titles);
    }
    if (changes.tooltips) {
      this.tips = this.doI18n(this.tooltips);
    }
  }
  onChangeLang(): void {
    this.pTitles =  this.doI18n(this.titles);
    this.tips = this.doI18n(this.tooltips);
  }

  doI18n(what: string[] | TitleType[]): string[] {
    if (this.options.length > 0 && this.needI18n(what)) {
      return this.i18n(what as TitleType[]);
    }
    return what as string[];
  }
  private i18n(t: TitleType[], cp: boolean = true): string[] {
    const lbl = [];
    for (const o of this.options) {
      const tls = t.filter(v => v.id === o);
      if (tls.length > 0) {
        lbl.push(this.systemLang.getTitle(tls));
      } else if (cp) {
        lbl.push(cp ? o : undefined);
      }
    }
    return lbl;
  }

  writeValue(obj: any): void {
    if (Array.isArray(obj)) {
      this.values = obj;
    } else {
      this.values = [];
    }
  }
  registerOnChange(fn: (_: any) => {}): void {
    this.change = fn;
  }
  registerOnTouched(fn: any): void {
      this.touch = fn();
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  onChange($event: Event): void {
    const target: HTMLInputElement = $event.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT') {
      const idx = this.values.indexOf(target.value);
      if (idx >= 0) {
        this.values.splice(idx, 1);
      } else {
        this.values.push(target.value);
      }
      this.emitChange(this.values);
    }
  }
  protected emitChange(value: any): void {
    if (typeof this.change === 'function') {
      this.change(value);
    }
  }
  onBlur(): void {
    if (typeof this.touch === 'function') {
      this.touch();
    }
  }
}
