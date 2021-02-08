import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SelectControlComponent} from './select-control.component';
import {ControlValueAccessor} from '@angular/forms';
import {SystemLang} from '../i18n';
import {coerceArray} from '@angular/cdk/coercion';

@Component({
  selector: 'lib-list-builder',
  templateUrl: './list-builder.component.html',
  styleUrls: ['./checkbox-control.component.scss']
})
export class ListBuilderComponent extends SelectControlComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  availableList: string[];
  resultList: string[];

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

}
