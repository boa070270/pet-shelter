import {ChangeDetectorRef, Component, forwardRef, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SystemLang} from '../i18n';
import {CheckboxControlComponent} from './checkbox-control.component';
import {Directionality} from '@angular/cdk/bidi';
import {RootPageService} from "../shared/root-page.service";

export const RADIO_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioControlComponent),
  multi: true
};

@Component({
  selector: 'lib-radio-control',
  templateUrl: './radio-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [RADIO_VALUE_ACCESSOR],
})
export class RadioControlComponent extends CheckboxControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              protected changeDetect: ChangeDetectorRef, protected rootPage: RootPageService) {
    super(systemLang, directionality, changeDetect, rootPage);
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
      super.writeValue(obj);
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
    const target: HTMLInputElement = $event.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT') {
      this.clearAll();
      this.values[target.value] = true;
      this.emitChange(this.getArrayValues()[0]);
    }
  }

}

