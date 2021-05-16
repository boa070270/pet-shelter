import {Component, Input, OnChanges} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {RootPageService} from '../../shared';
import {SystemLang} from '../../i18n';

@Component({
  selector: 'lib-span',
  template: '<span>{{txt}}</span>',
  styleUrls: ['./span.component.css']
})
export class SpanComponent extends AbstractComponent implements OnChanges {
  @Input() txt: string;

  constructor(public systemLang: SystemLang, protected rootPage: RootPageService) {
    super(systemLang, rootPage);
  }

}
