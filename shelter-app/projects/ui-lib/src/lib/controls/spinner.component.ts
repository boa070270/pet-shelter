import {Component, OnDestroy, ViewContainerRef} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {I18N_CFG} from '../shared';

const I18N = {
  loading: [{lang: 'en', title: 'Loading...'}, {lang: 'uk', title: 'Загрузка...'}]
};
@Component({
  selector: 'lib-spinner',
  template: '<div class="loader">Loading...</div>',
  styleUrls: ['./spinner.component.scss'],
  providers: [
    {provide: I18N_CFG, useValue: I18N}
  ]
})
export class SpinnerComponent extends AbstractComponent implements OnDestroy {

  constructor(protected _view: ViewContainerRef) {
    super(_view);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
