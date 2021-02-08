import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {TableComponent} from './table.component';
import {TableControl} from './table-control';

@Directive({
  selector: '[libTableRowSelector]',
  host: {
    '(click)': 'onClick()'
  }
})
export class TableRowSelectorDirective implements OnDestroy {
  @Input() libTableRowSelector: any;
  constructor(private tableControlComponent: TableComponent,
              private tableControl: TableControl,
              private element: ElementRef) {
    if (this.tableControlComponent.tableControl === tableControl) {
      console.log('TableRowSelectorDirective: the same tableControl');
    } else {
      console.log('TableRowSelectorDirective: different tableControl');
    }
    console.log('TableRowSelectorDirective.constructor');
  }
  onClick(): void {
    console.log('TableRowSelector.onClick', this.tableControlComponent, this.element);
  }

  ngOnDestroy(): void {
    console.log('TableRowSelectorDirective.ngOnDestroy');
  }
}
