import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {BaseComponent} from './base.component';
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
export class CheckboxControlComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() direction: 'row' | 'col' | 'grid' = 'col';
  @Input() cols: number;
  @Input() options: string[];
  @Input() titles: {[key: string]: string} | TitleType[];
  @Input() optionAsTitle = true;
  @Input() tooltips: string[] | TitleType[];
  @Input() indeterminate: boolean = null;
  values: {[key: string]: any} = {};
  pTitles: {[id: string]: string};
  tips: {[id: string]: string};
  disabled: boolean;

  constructor(public systemLang: SystemLang) {
    super(systemLang);
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
    console.log('CheckboxControlComponent.onChange', this.indeterminate, this.values);
  }
  setValue(key: string, value: any): void {
    if (this.options.includes(key)) {
      this.values[key] = value;
      this.values = Object.assign({}, this.values);
    }
  }
  getValue(key: string): any {
    return this.values[key];
  }
  protected clearValue(key: string): void {
    this.values[key] = null;
  }
  protected toggle(key: string): void {
    this.values[key] = !this.values[key];
  }
  setObject(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      if (this.options.includes(key)) {
        this.values[key] = true;
      }
    }
    this.values = Object.assign({}, this.values);
  }
  setArray(opt: Array<string>): void {
    for (const key of opt) {
      if (this.options.includes(key)) {
        this.values[key] = true;
      }
    }
    this.values = Object.assign({}, this.values);
  }
  getArrayValues(): string[] {
    return this.options.filter(o => this.values[o]);
  }
  clearAll(): void {
    this.values = {};
    if (Array.isArray(this.options)) {
      this.options.forEach(o => this.values[o] = null);
    }
  }
}
