import {Component, ElementRef, Input, SimpleChanges, OnChanges, OnDestroy, DoCheck, OnInit} from '@angular/core';
import { DynamicHTMLRenderer, DynamicHTMLRef } from './renderer';
/**
 * See https://www.arka.com/blog/dynamically-generate-angular-components-from-external-html
 */

// tslint:disable-next-line:no-conflicting-lifecycle
@Component({
  selector: 'lib-dynamic-html',
  template: ''
})
export class DynamicHTMLComponent implements OnInit, DoCheck, OnChanges, OnDestroy {
  @Input() content: string;

  private ref: DynamicHTMLRef = null;

  constructor(
    private renderer: DynamicHTMLRenderer,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    console.log('content:', this.content);
  }
  ngOnChanges(_: SimpleChanges): void {
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
    if (this.content && this.elementRef) {
      this.ref = this.renderer.renderInnerHTML(this.elementRef, this.content);
    }
  }

  ngDoCheck(): void {
    if (this.ref) {
      this.ref.check();
    }
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
  }
}
