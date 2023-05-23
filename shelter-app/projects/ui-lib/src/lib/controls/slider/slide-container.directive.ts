import {Directive, HostBinding} from '@angular/core';
import {IntervalObservableService} from '../../shared';

@Directive({
  selector: '[libSlideContainer]'
})
export class SlideContainerDirective {
  private slides = 0;
  private order = 0;
  @HostBinding() style: string;
  constructor(private intervalObserver: IntervalObservableService) {
    this.showSlide();
  }
  private showSlide(): void {
    this.style = `left: 0px; transform: translateX(-${this.order * 100}%)`;
  }
  addSlide(): number {
    return this.slides++;
  }
  next(): void {
    if (++this.order >= this.slides) {
      this.order = 0;
    }
    this.showSlide();
  }
  prev(): void {
    if (--this.order < 0) {
      this.order = this.slides - 1;
    }
    this.showSlide();
  }
  to(slide: number): void {
    if (slide >= 0 && slide < this.slides) {
      this.order = slide;
    }
    this.showSlide();
  }
  get slide(): number {
    return this.order;
  }
}
