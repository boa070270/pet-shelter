import {fromEvent, interval, Observable, Operator, OperatorFunction, partition} from 'rxjs';
import {filter, repeatWhen, shareReplay, takeUntil, tap} from 'rxjs/operators';

export function whenPageVisible<T>(): (s: Observable<T>) => Observable<T> {
  const visibilitychange$ = fromEvent(document, 'visibilitychange').pipe(
    tap(n => {
      console.log('event', n);
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  const [pageVisible$, pageHidden$] = partition(
    visibilitychange$,
    () => document.visibilityState === 'visible'
  );

  return (source: Observable<T>) => {
    return source.pipe(
      takeUntil(pageHidden$),
      repeatWhen(() => pageVisible$)
    );
  };
}
export function scheduler(period: number): Observable<number> {
  return interval(period).pipe(whenPageVisible());
}
