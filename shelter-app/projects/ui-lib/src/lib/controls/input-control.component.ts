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
