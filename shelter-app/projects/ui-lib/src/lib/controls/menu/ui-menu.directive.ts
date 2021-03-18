import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  Optional,
  SkipSelf
} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AbstractMenuClass} from './abstract-menu';

@Directive({
  selector: '[libUiMenu]'
})
export class UiMenuDirective extends AbstractMenuClass implements AfterContentInit, OnDestroy {
  protected readonly destroyed = new Subject<void>();
  constructor(private element: ElementRef,
              @Optional() @SkipSelf() private uiMenu: UiMenuDirective,
              private readonly _ngZone: NgZone,
              private changeDetector: ChangeDetectorRef) {
    super(uiMenu);
  }

  callDetectChanges(): void {
    this.changeDetector.detectChanges();
  }
  onCounterChange(): void {}
  ngAfterContentInit(): void {
    if (this.child) {
      this._ngZone.runOutsideAngular(() => {
        fromEvent<MouseEvent>(this.element.nativeElement, 'mouseenter').pipe(
          takeUntil(this.destroyed),
        ).subscribe(() => {
          this.child.incCounter(this);
        });

        fromEvent<MouseEvent>(this.element.nativeElement, 'mouseleave').pipe(
          takeUntil(this.destroyed),
        ).subscribe(() => {
          this.child.decCounter(this);
        });
      });
    }
  }
  ngOnDestroy(): void {
    this.destroyed.next();
  }
  thisRect(): DOMRect {
    return this.element.nativeElement.getBoundingClientRect();
  }

}

