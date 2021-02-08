import {Component, forwardRef, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SelectControlComponent} from './select-control.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {coerceArray} from '@angular/cdk/coercion';

export const LIST_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ListSelectComponent),
  multi: true
};
@Component({
  selector: 'lib-list-select',
  templateUrl: './list-select.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [LIST_SELECT_VALUE_ACCESSOR]
})
export class ListSelectComponent extends SelectControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  constructor(public systemLang: SystemLang) {
    super(systemLang);
    this.multiple = true;
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
    const target = $event.target as HTMLLIElement;
    if (target && target.tagName === 'LI') {
      const opt = this.options[target.value];
      if (this.multiple) {
        this.toggle(opt);
      } else {
        if (this.getValue(opt)) {
          this.clearValue(opt);
        } else {
          this.clearAll();
          this.toggle(opt);
        }
      }
      this.values = Object.assign({}, this.values);
      if (this.multiple) {
        this.emitChange(this.getArrayValues());
      } else {
        this.emitChange(this.getArrayValues()[0]);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    console.log(event);
    switch (event.code) {
      case 'ArrowUp':
        break;
      case 'ArrowDown':
        break;
    }
  }
}
