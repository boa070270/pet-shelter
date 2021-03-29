import {EventEmitter, Injectable, NgZone} from '@angular/core';

export interface ScrollEvent {
  direction: 'Up' | 'Down';
  pageYOffset: number;
}
@Injectable({
  providedIn: 'root'
})
export class ScrollEventService {
  private emitter = new EventEmitter<ScrollEvent>();
  get eventEmitter(): EventEmitter<ScrollEvent> {
    return this.emitter;
  }
  private yOffset = 0;
  get pageYOffset(): number {
    return this.yOffset;
  }
  constructor(private zone: NgZone) {
    zone.runOutsideAngular(() => {
      window.addEventListener('scroll', (e) => this.handler(e));
    });
    this.yOffset = Math.ceil(window.pageYOffset);
  }
  handler(e: Event): void {
    const pageYOffset = Math.ceil(window.pageYOffset);
    const se: ScrollEvent = {
      direction: this.yOffset > pageYOffset ? 'Up' : 'Down',
      pageYOffset
    };
    this.yOffset = pageYOffset;
    this.emitter.emit(se);
  }
}
