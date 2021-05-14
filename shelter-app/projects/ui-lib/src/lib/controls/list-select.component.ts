import {ChangeDetectorRef, Component, forwardRef, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SelectControlComponent} from './select-control.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {coerceArray} from '@angular/cdk/coercion';
import {Directionality} from '@angular/cdk/bidi';
import {RootPageService} from "../shared/root-page.service";

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

  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              protected changeDetect: ChangeDetectorRef, protected rootPage: RootPageService) {
    super(systemLang, directionality, changeDetect, rootPage);
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
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    // TODO https://developer.mozilla.org/ru/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
    switch (event.code) {
      case 'ArrowUp':
        // TODO we need to switch focus on the prev row if it present, else like tab switch to the prev focused element
        break;
      case 'ArrowDown':
        // TODO we need to switch focus on the next row if it present, else like tab switch to the next focused element
        break;
      case 'Space':
        // TODO select | unselect current row
        break;
    }
  }
}
