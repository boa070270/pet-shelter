import {Component, Directive, ElementRef, Host, Inject, Input, OnInit, Self, SkipSelf} from '@angular/core';
import {ROOT_PAGE_DATA, RootPageService, RootPageServiceImpl} from '../shared';
import {IteratorDirective} from './abstract-iterator.component';
import {deepCloneNode} from "../editor/clone-node";

@Directive({
  selector: '[switch-page-data]',
  providers: [
    {provide: ROOT_PAGE_DATA, useClass: RootPageServiceImpl}
  ]
})
export class SwitchPageDataComponent implements OnInit {
  @Input() data: any;
  @Input() prefix: string;
  @Input('index') index: number;
  constructor(private element: ElementRef,
              @Host() private iterator: IteratorDirective,
              @Self() @Inject(ROOT_PAGE_DATA) private root: RootPageService,
              @SkipSelf() @Inject(ROOT_PAGE_DATA) protected parentRoot: RootPageService) {
  }

  ngOnInit(): void {
    console.log('SwitchPageDataComponent.onInit');
    this.setData();
    if (this.iterator.projectableNodes && this.iterator.projectableNodes.length > 0) {
      const e: HTMLElement = this.element.nativeElement;
      this.iterator.projectableNodes.forEach(
        a => a.forEach(n => e.appendChild(deepCloneNode(n as HTMLElement)))
      );
      console.log(e);
    }
  }
  private setData(): void {
    if (this.data && this.prefix) {
      this.root = RootPageServiceImpl.fromRoot(this.parentRoot as RootPageServiceImpl);
      Object.keys(this.data || {}).forEach(k => {
        const key = (this.prefix ? this.prefix + '.' : '') + k;
        this.root.setData(key, this.data[k]);
      });
      this.root.setData(this.prefix + '#index', this.index);
    }
  }
}
// @Directive({
//   selector: '[renderNgContent]'
// })
// // tslint:disable-next-line:directive-class-suffix
// export class RenderNgContentDirective implements OnInit {
//   constructor(private element: ElementRef,
//               @Host() private iterator: IteratorDirective,
//               @Inject(ROOT_PAGE_DATA) protected parentRoot: RootPageService) {
//     console.log(iterator);
//     console.log(this.iterator.projectableNodes);
//     if (this.iterator.projectableNodes && this.iterator.projectableNodes.length > 0) {
//       const e: HTMLElement = this.element.nativeElement;
//       this.iterator.projectableNodes.forEach(
//         a => a.forEach(n => e.appendChild(deepCloneNode(n as HTMLElement)))
//       );
//       console.log(e);
//     }
//   }
//   ngOnInit(): void {
//
//   }
// }
