import {AfterViewInit, Component, OnDestroy, QueryList, ViewChild} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {IsVisibleDirective} from './is-visible.directive';
import {auditTime} from 'rxjs/operators';

@Component({
  selector: 'lib-end-page',
  template: '<div libIsVisible><ng-content></ng-content></div>',
})
export class EndPageComponent implements OnDestroy, AfterViewInit {
  @ViewChild(IsVisibleDirective) divElement: IsVisibleDirective;
  private subject = new Subject<boolean>();
  private subs: Subscription = Subscription.EMPTY;

  constructor() {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.subs = this.divElement.change(0).subscribe(v => this.subject.next(v));
  }

  isVisible(): boolean {
    return this.divElement ? this.divElement.isVisible() : false;
  }
  change(throttleTime?: number): Observable<boolean> {
    return throttleTime > 0 ? this.subject.pipe(auditTime(throttleTime)) : this.subject;
  }

}
