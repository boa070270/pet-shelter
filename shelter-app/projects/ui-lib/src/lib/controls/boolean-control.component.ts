import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {CheckboxControlComponent} from './checkbox-control.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

export const BOOLEAN_INPUT_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BooleanControlComponent),
  multi: true
};
@Component({
  selector: 'lib-boolean-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  providers: [BOOLEAN_INPUT_ACCESSOR]
})
export class BooleanControlComponent extends CheckboxControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  constructor(protected _view: ViewContainerRef,
              protected changeDetect: ChangeDetectorRef) {
    super(_view, changeDetect);
  }

  ngOnInit(): void {
    this.options = ['b0'];
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  writeValue(obj: any): void {
    super.writeValue(coerceBooleanProperty(obj) ? ['true'] : null);
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

  protected emitChange(value: any): void {
    super.emitChange(!!this.values.b0);
  }

}
