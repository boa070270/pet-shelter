import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CheckboxControlComponent} from './checkbox-control.component';
import {SystemLang} from '../i18n';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceArray} from '@angular/cdk/coercion';

export const SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectControlComponent),
  multi: true
};

@Component({
  selector: 'lib-select-control',
  templateUrl: './select-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [SELECT_VALUE_ACCESSOR],
})
export class SelectControlComponent extends CheckboxControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() multiple: boolean;
  @Input() required: boolean;

  constructor(public systemLang: SystemLang) {
    super(systemLang);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  writeValue(obj: any): void {
    if (obj !== null && obj !== undefined) {
      super.writeValue(coerceArray(obj));
    }
  }
  registerOnChange(fn: (_: any) => {}): void {
    super.registerOnChange(fn);
  }
  registerOnTouched(fn: any): void {
    super.registerOnTouched(fn);
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
  }
  onChange($event: Event): void {
    const target = $event.target as HTMLSelectElement;
    if (target && target.tagName === 'SELECT') {
      const selectedOptions = target.selectedOptions;
      this.clearAll();
      if (selectedOptions !== undefined) {
        for (let i = 0; i < selectedOptions.length; ++i) {
          this.toggle(selectedOptions.item(i).value);
        }
      } else {
        const options = target.options;
        for (let i = 0; i < options.length; i++) {
          const opt: HTMLOptionElement = options.item(i);
          if (opt.selected) {
            this.toggle(opt.value);
          }
        }
      }
      if (this.multiple) {
        this.emitChange(this.getArrayValues());
      } else {
        this.emitChange(this.getArrayValues()[0]);
      }
    }
  }

}
