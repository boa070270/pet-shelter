import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonFieldConfig, convertToInternal, FormDialogConfiguration, FunctionMap} from './form-configuration';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'lib-dynamic-form-dialog',
  templateUrl: './dynamic-form-dialog.component.html',
  styleUrls: ['./dynamic-form-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormDialogComponent<T> {
  formConfiguration: Array<CommonFieldConfig>;
  formGroup: FormGroup;
  converterToForm: FunctionMap<any, any> = (d) => d;
  converterFromForm: FunctionMap<any, any> = (d) => d;

  constructor(public dialogRef: MatDialogRef<DynamicFormDialogComponent<T>>,
              @Inject(MAT_DIALOG_DATA) public data: FormDialogConfiguration<T>) {
    const {formConfiguration, formGroup} = convertToInternal(this.data.configuration);
    this.formConfiguration = formConfiguration;
    this.formGroup = formGroup;
    if (this.data && this.data.configuration && this.data.configuration.options && this.data.configuration.options.converterToForm) {
      this.converterToForm = this.data.configuration.options.converterToForm;
    }
    if (this.data && this.data.configuration && this.data.configuration.options && this.data.configuration.options.converterFromForm) {
      this.converterFromForm = this.data.configuration.options.converterFromForm;
    }
    const formValue = this.converterToForm(this.data.data || {});
    this.formGroup.setValue(formValue);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  finish(): void {
    this.dialogRef.close(this.converterFromForm(this.formGroup.value));
  }
}
