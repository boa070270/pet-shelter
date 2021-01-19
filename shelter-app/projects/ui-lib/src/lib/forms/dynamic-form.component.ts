import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {CommonFieldConfig, convertToInternal, FormConfiguration} from './form-configuration';

@Component({
  selector: 'lib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent<T> implements OnInit, OnChanges {
  dynamicForm: FormGroup;
  formConfiguration: Array<CommonFieldConfig>;
  @Input() configuration: FormConfiguration<T>;
  @Input() data: T;
  formClass: any;
  private converterToForm: (r: T) => any;
  private converterFromForm: (r: any) => T;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkRequired();
  }

  ngOnInit(): void {
    this.checkRequired();
    if (this.configuration.options) {
      const options = this.configuration.options;
      if (options.formClass) {
        this.formClass = options.formClass;
      }
      if (options.converterToForm) {
        this.converterToForm = options.converterToForm;
      }
      if (options.converterFromForm) {
        this.converterFromForm = options.converterFromForm;
      }
    }
    const {formConfiguration, formGroup} = convertToInternal(this.configuration);
    this.formConfiguration = formConfiguration;
    this.dynamicForm = formGroup;
    const formValue = this.converterToForm(this.data);
    this.dynamicForm.setValue(formValue);
  }
  checkRequired(): void {
    if (!this.configuration) {
      throw new TypeError('configuration is required');
    }
  }
  getData(): T {
    return this.converterFromForm(this.dynamicForm.value);
  }
}

