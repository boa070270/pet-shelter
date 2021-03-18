import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {SystemLang} from '../i18n';
import {DictionaryService} from '../shared';

const I18N = {
  loading: [{lang: 'en', title: 'Loading...'}, {lang: 'uk', title: 'Загрузка...'}]
};
@Component({
  selector: 'lib-spinner',
  template: '<div class="loader">Loading...</div>',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent extends AbstractComponent implements OnDestroy {

  constructor(public systemLang: SystemLang, dictionary: DictionaryService) {
    super(systemLang, dictionary.getLibDictionary('SpinnerComponent', I18N));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
