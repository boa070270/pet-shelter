import {Component, forwardRef, Inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ArrayDataSource, I18NType, SwaggerArray, SwaggerComponent, SwaggerNative, SwaggerObject} from '../shared';
import {TableComponent} from '../controls';
import {FormErrorsService} from './form-errors.service';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';
import {BaseSwaggerComponent} from './base-swagger.component';

@Component({
  selector: 'lib-swagger-array',
  template: `
    <lib-table [swagger]="items" [dataSource]="dataSource" [disabled]="disabled"></lib-table>`,
  styleUrls: ['./swagger-array.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwaggerArrayComponent),
    multi: true
  }]
})
export class SwaggerArrayComponent extends BaseSwaggerComponent implements OnInit, OnDestroy, ControlValueAccessor, SwaggerComponent {

  dataSource = ArrayDataSource.EmptyDS();
  @Input()
  nameControl: string;
  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  get items(): SwaggerNative | SwaggerObject {
    return (this.swagger as SwaggerArray).items;
  }
  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              protected formErrors: FormErrorsService) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  registerOnChange(fn: any): void {
    this.table.registerOnChange(fn);
  }
  registerOnTouched(fn: any): void {
    this.table.registerOnTouched(fn);
  }
  writeValue(obj: any): void {
    this.table.writeValue(obj);
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
  }

}
