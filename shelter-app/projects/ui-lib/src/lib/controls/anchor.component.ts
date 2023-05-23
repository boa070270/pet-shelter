import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {AbstractComponent} from './abstract.component';

@Component({
  selector: 'lib-anchor',
  template: '<a [routerLink]="href" [title]="title"></a>',
})
export class AnchorComponent extends AbstractComponent {
  @Input() title: string;
  @Input() href: string;
  constructor(protected _view: ViewContainerRef) {
    super(_view);
  }

}
