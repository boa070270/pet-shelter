import {Directive, HostBinding} from '@angular/core';
import {SlideContainerDirective} from './slide-container.directive';

@Directive({
  selector: '[libSlideElement]'
})
export class SlideElementDirective {
  private readonly order: number;
  @HostBinding('style')
  style: string;
  constructor(private parent: SlideContainerDirective) {
    this.order = this.parent.addSlide();
    this.style = `position: absolute; left: ${this.order * 100}%;`;
  }
}
