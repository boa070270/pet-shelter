import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {BaseControlComponent} from './base-control.component';
import {SystemLang, TitleType} from '../i18n';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export const INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputControlComponent),
  multi: true
};


@Component({
  selector: 'lib-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.css'],
  providers: [INPUT_VALUE_ACCESSOR]
})
export class InputControlComponent extends BaseControlComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() title: string | TitleType[];
  @Input() tooltip: string | TitleType[];
  @Input() placeholder: string | TitleType[];
  @Input() leadingIcon: string;
  @Input() trailingIcon: string;
  @Input() error: string;
  // Bind Element property
  @Input() type = 'text';
  @Input() hidden: boolean;
  @Input() disabled: boolean;
  @Input() id: string;
  @Input() accessKey: string;
  @Input() name: string;
  @Input() formTarget: string;
  @Input() formAction: string;
  @Input() formNoValidate: boolean;
  @Input() formMethod: string;
  @Input() formEnctype: string;
  @Input() autofocus: boolean;
  @Input() tabIndex: number;
  value: string;
  pTitle: string;
  pTooltip: string;
  pPlaceholder: string;
  change: (_: any) => {};
  touch: () => {};

  constructor(public systemLang: SystemLang) {
    super(systemLang);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.pTitle = this.doIfNeedI18n(this.title);
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    super.ngOnChanges(changes);
    if (changes.title) {
      this.pTitle = this.doIfNeedI18n(this.title);
    }
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
    this.pTitle = this.doIfNeedI18n(this.title);
    this.pTooltip = this.doIfNeedI18n(this.tooltip);
    this.pPlaceholder = this.doIfNeedI18n(this.placeholder);
  }
  writeValue(obj: any): void {
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
    console.log($event);
    const target = $event.target as HTMLInputElement;
    if (target.tagName === 'INPUT') {
      this.value = target.value;
    }
    if (typeof this.change === 'function') {
      this.change(this.value);
    }
  }
}
