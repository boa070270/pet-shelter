import {Directive, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/overlay';
import {auditTime} from 'rxjs/operators';

const DEFAULT_THROTTLE_TIME = 50;

@Directive({
  selector: '[libIsVisible]'
})
export class IsVisibleDirective implements OnDestroy {
  @Input() throttle = 100;
  private subs1: Subscription;
  private subs2: Subscription;
  // @ts-ignore
  private subject = new BehaviorSubject<boolean>();
  private visible = false;

  constructor(private el: ElementRef, private viewportRuler: ViewportRuler,
              private scrollDispatcher: ScrollDispatcher) {
    this.subs1 = viewportRuler.change(this.throttle).subscribe(() => this.onChange());
    this.subs2 = scrollDispatcher.scrolled(this.throttle).subscribe(() => this.onChange());
    this.onChange();
  }

  ngOnDestroy(): void {
    this.subs1.unsubscribe();
    this.subs2.unsubscribe();
  }
  isVisible(): boolean {
    return this.visible;
  }
  private onChange(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportSize = this.viewportRuler.getViewportSize();
    this.visible = rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportSize.height && /* or $(window).height() */
      rect.right <= viewportSize.width; /* or $(window).width() */
    this.subject.next(this.visible);
  }
  change(throttleTime: number = DEFAULT_THROTTLE_TIME): Observable<boolean> {
    return throttleTime > 0 ? this.subject.pipe(auditTime(throttleTime)) : this.subject;
  }

}
