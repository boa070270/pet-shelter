import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {BaseControlComponent} from './base-control.component';
import {SystemLang} from '../i18n';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TitleType} from '../shared';

export const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputControlComponent),
  multi: true
};

@Component({
  selector: 'lib-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss'],
  providers: [INPUT_VALUE_ACCESSOR]
})
export class InputControlComponent extends BaseControlComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() tooltip: string | TitleType[];
  @Input() placeholder: string | TitleType[];
  @Input() leadingIcon: string;
  @Input() trailingIcon: string;
  // Bind Element property
  @Input() type = 'text';
  @Input() hidden: boolean;
  @Input() disabled: boolean;
  @Input() accessKey: string;
  @Input() formTarget: string;
  @Input() formAction: string;
  @Input() formNoValidate: boolean;
  @Input() formMethod: string;
  @Input() formEnctype: string;
  @Input() autofocus: boolean;
  @Input() tabIndex: number;
  value: string;
  pTooltip: string;
  pPlaceholder: string;
  change: (_: any) => {};
  touch: () => {};
  pError: string;
  iconsClass: any;

  constructor(public systemLang: SystemLang) {
    super(systemLang);
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
    if (changes.error) {
      this.pError = this.doIfNeedI18n(this.error);
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  onChangeLang(): void {
    super.onChangeLang();
    this.pCaption = this.doIfNeedI18n(this.caption);
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
    this.pError = this.doIfNeedI18n(this.error);
  }
  writeValue(obj: any): void {
    console.log('InputControlComponent.writeValue', obj);
    this.value = (obj !== undefined && isNaN(obj) && typeof obj !== 'object') ? obj.toString() : null;
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
