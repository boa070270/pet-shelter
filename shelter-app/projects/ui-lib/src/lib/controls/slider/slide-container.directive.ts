import {Directive, HostBinding} from '@angular/core';

@Directive({
  selector: '[libSlideContainer]'
})
export class SlideContainerDirective {
  slides = 0;
  private order = 0;
  @HostBinding() style: string;
  constructor() {
    this.showSlide();
  }
  private showSlide(): void {
    this.style = `left: 0px; transform: translateX(-${this.order}%)`;
  }
  addSlide(): number {
    return this.slides++;
  }
  next(): void {
    if (++this.order > this.slides) {
      this.order = 0;
    }
    this.showSlide();
  }
  prev(): void {
    if (++this.order > this.slides) {
      this.order = 0;
    }
    this.showSlide();
  }
}
