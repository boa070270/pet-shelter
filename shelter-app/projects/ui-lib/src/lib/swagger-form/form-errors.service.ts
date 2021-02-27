import {Injectable} from '@angular/core';
import {choiceFormat, DictionaryService, I18NType, isTitleType, TitleType} from '../shared';
import {ValidationErrors} from '@angular/forms';

const I18N: I18NType = {
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
@Injectable({
  providedIn: 'root'
})
export class FormErrorsService {
  private readonly i18n;
  constructor(private dictionary: DictionaryService) {
    this.i18n = dictionary.getLibDictionary('FormErrorsService', I18N);
  }
  getError(err: ValidationErrors): Array<string | TitleType> {
    if (err) {
      const result: Array<string | TitleType> = [];
      Object.keys(err).forEach( key => {
        const msg = this.i18n[key];
        if (msg) {
          if (Array.isArray(msg)) {
            for (const m of msg) {
              this.addMsg(result, key, m, err[key]);
            }
          } else {
            this.addMsg(result, key, msg, err[key]);
          }
        }
      });
      if (result.length > 0) {
        return result;
      }
    }
    return null;
  }
  private addMsg(dest: Array<string | TitleType>, id: string, msg: string | TitleType[], detail: any): void {
    if (isTitleType(msg)) {
      // @ts-ignore
      const {lang, title} = msg;
      dest.push({id, lang, title: this.formatError(id, title, detail)});
    } else {
      dest.push({id, lang: 'en', title: this.formatError(id, msg, detail)});
    }
  }
  private formatError(key, title, detail: any): string {
    switch (key) {
    case 'min': // {min: {min: 3, actual: 2}}
      return choiceFormat(title, detail.min, detail.actual);
    case 'max': // {max: {max: 15, actual: 16}}
      return choiceFormat(title, detail.max, detail.actual);
    case 'required': // {required: true}
      return title;
    case 'email': // {email: true}
      return title;
    case 'minlength': // {minlength: {requiredLength: 3, actualLength: 2}}
      return choiceFormat(title, detail.requiredLength, detail.actualLength);
    case 'maxlength': // {maxlength: {requiredLength: 5, actualLength: 7}}
      return choiceFormat(title, detail.requiredLength, detail.actualLength);
    case 'pattern': // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
      return choiceFormat(title, detail.requiredPattern, detail.actualValue);
    default:
      return 'Unknown error';
    }
  }
}
