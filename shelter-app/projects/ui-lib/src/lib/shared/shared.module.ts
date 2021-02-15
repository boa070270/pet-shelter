import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DictionaryService} from './dictionary.service';
import {TitleType} from './language';

const FORM_VALIDATION_ERROR = 'form-errors';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule
  ],
  exports: [
  ]
})
export class SharedModule {
  constructor(dictionary: DictionaryService) {
    const formErrors: {[key: string]: TitleType[]} = {
      min: [ // {min: {min: 3, actual: 2}}
        {lang: 'en', title: 'Violates minimum threshold, minimum is {0} actual {1}'},
        {lang: 'uk', title: 'Порушує мінімальне значення, минімальне {0} введено {1}'},
        ],
      max: [ // {max: {max: 15, actual: 16}}
        {lang: 'en', title: 'Violates maximum threshold, maximum is {0} actual {1}'},
        {lang: 'uk', title: 'Порушує максимальне значення, максимальне {0} введено {1}'}
        ],
      required: [ // {required: true}
        {lang: 'en', title: 'This value is required'},
        {lang: 'uk', title: 'Це поле обов\'язкове'},
        ],
      email: [ // {email: true}
        {lang: 'en', title: 'Invalid e-mail'},
        {lang: 'uk', title: 'Невірний e-mail'},
        ],
      minlength: [ // {minlength: {requiredLength: 3, actualLength: 2}}
        {lang: 'en', title: 'Violates minimum length threshold, minimum is {0} actual {1}'},
        {lang: 'uk', title: 'Порушує мінімальну довжину, минімальна {0} введено {1}'},
        ],
      maxlength: [ // {maxlength: {requiredLength: 5, actualLength: 7}}
        {lang: 'en', title: 'Violates maximum length threshold, maximum is {0} actual {1}'},
        {lang: 'uk', title: 'Порушує максимальну довжину, максимальна {0} введено {1}'},
        ],
      pattern: [ // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
        {lang: 'en', title: 'Violates pattern, required {0} actual {1}'},
        {lang: 'uk', title: 'Порушує шаблон для цього значеня, шаблон {0} введено {1}'},
        ]
    };
    dictionary.setDictionary(FORM_VALIDATION_ERROR, formErrors);
  }
}
