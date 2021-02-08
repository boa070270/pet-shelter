import {Directive, OnDestroy} from '@angular/core';
import {TableControl} from './table-control';
import {TableComponent} from './table.component';
import {Observable} from 'rxjs';

@Directive({
  selector: '[libTableControl]'
})
export class TableControlDirective implements OnDestroy{
  dataSource: Observable<any>;
  selected: Array<any> = [];

  constructor(private tableControlComponent: TableComponent,
              public tableControl: TableControl) {
    console.log('TableControlDirective.constructor');
    if ( tableControlComponent.tableControl === tableControl) {
      console.log('TableControlDirective: the same tableControl');
    } else {
      console.log('TableControlDirective: different tableControl');
    }
  }
  ngOnDestroy(): void {
    console.log('TableControlDirective.ngOnDestroy');
  }

}
