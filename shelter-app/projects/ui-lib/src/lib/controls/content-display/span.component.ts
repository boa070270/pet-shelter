import {Component, Input, OnChanges, ViewContainerRef} from '@angular/core';
import {AbstractComponent} from '../abstract.component';

@Component({
  selector: 'lib-span',
  template: '<span>{{txt}}</span>',
  styleUrls: ['./span.component.css']
})
export class SpanComponent extends AbstractComponent implements OnChanges {
  @Input() txt: string;

  constructor(protected _view: ViewContainerRef) {
    super(_view);
  }

}
