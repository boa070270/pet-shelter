import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {VisibilityChangeService} from '../visibility-change.service';
import {Observable, Subject, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervalObservableService implements OnDestroy {
  private subscription: Subscription;
  private intervalSubject = new Subject<number>();
  private next = 0;
  private interval: any;

  constructor(visibilityChange: VisibilityChangeService, private readonly _ngZone: NgZone) {
    this.subscription = visibilityChange.observable().subscribe((isShow) => this.stopStartInterval(isShow));
    this.init();
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.clear();
  }
  private clear(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.next = 0;
    }
  }
  private init(): void {
    if (!this.interval) {
      this._ngZone.runOutsideAngular(() => {
        this.interval = setInterval( () => this.intervalSubject.next(this.next++), 1000);
      });
    }
  }
  private stopStartInterval(isShow: boolean): void {
    if (isShow) {
      this.init();
    } else {
      this.clear();
    }
  }
  observable(): Observable<number> {
    return this.intervalSubject;
  }
  scheduler(callback: CallableFunction, inSecond: number): Subscription {
    return this.intervalSubject.subscribe((n) => {
      if ((n % inSecond) === 0) {
        callback();
      }
    });
  }
}
