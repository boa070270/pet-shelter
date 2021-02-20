import {Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  ArrayDataSource,
  ComponentsPluginService,
  SwaggerArray,
  SwaggerComponent,
  SwaggerGroupComponent, SwaggerNative, SwaggerObject
} from '../shared';
import {SwaggerNativeComponent} from './swagger-native.component';
import {TableComponent} from "../controls";

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
export class SwaggerArrayComponent extends SwaggerNativeComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor, SwaggerComponent {

  dataSource = ArrayDataSource.EmptyDS();
  @Input()
  nameControl: string;
  formGroup: FormGroup;
  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  get items(): SwaggerNative | SwaggerObject {
    return (this.swagger as SwaggerArray).itemsType;
  }
  constructor(protected componentsPlugin: ComponentsPluginService) {
    super(componentsPlugin);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('SwaggerArrayComponent.ngOnChanges', changes);
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
  protected defineControlType(): void {}

}
