import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ControlValueAccessor} from '@angular/forms';
import {SystemLang} from '../i18n';
import {SwaggerFormComponent} from './swagger-form.component';

@Component({
  selector: 'lib-table-control',
  templateUrl: './table-control.component.html',
  styleUrls: ['./table-control.component.scss']
})
export class TableControlComponent extends SwaggerFormComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  constructor(public systemLang: SystemLang) {
    super(systemLang);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  writeValue(obj: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

}
