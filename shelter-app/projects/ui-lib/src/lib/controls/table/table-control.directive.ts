import {Directive, Input, OnDestroy, Output} from '@angular/core';
import {TableControl} from './table-control';
import {TableControlComponent} from './table-control.component';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Directive({
  selector: '[libTableControl]'
})
export class TableControlDirective implements OnDestroy{
  dataSource: Observable<any>;
  selected: Array<any> = [];

  constructor(private tableControlComponent: TableControlComponent,
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
