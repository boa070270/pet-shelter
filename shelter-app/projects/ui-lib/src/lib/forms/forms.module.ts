import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormFieldsComponent } from './form-fields.component';
import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFormDialogComponent } from './dynamic-form-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { SharedModule } from '../shared';
import { StringFieldComponent } from './fields/string-field.component';

@NgModule({
  declarations: [
    DynamicFormComponent,
    FormFieldsComponent,
    DynamicFormDialogComponent,
    StringFieldComponent,
  ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatRadioModule,
      SharedModule
    ],
  exports: [
    DynamicFormComponent,
    FormFieldsComponent,
    DynamicFormDialogComponent,
  ],
})
export class FormsModule { }
