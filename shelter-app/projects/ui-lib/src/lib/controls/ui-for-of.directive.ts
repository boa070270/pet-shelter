import {
  AfterContentInit,
  Directive,
  DoCheck, Inject, Input,
  IterableDiffers,
  NgIterable,
  Self,
  SkipSelf,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {NgForOf, NgForOfContext} from '@angular/common';
import {ROOT_PAGE_DATA, RootPageService, RootPageServiceImpl} from '../shared';

@Directive({
  selector: '[uiFor][uiForOf]',
  providers: [
    {provide: ROOT_PAGE_DATA, useClass: RootPageServiceImpl}
  ]
})
export class UiForOfDirective<T, U extends NgIterable<T> = NgIterable<T>> extends NgForOf<T, U> implements AfterContentInit, DoCheck{
  @Input()
  set uiForOf(ngForOf: U&NgIterable<T>|undefined|null) {
    super.ngForOf = ngForOf;
  }
  constructor(private viewContainer: ViewContainerRef,
              private template: TemplateRef<NgForOfContext<T, U>>,
              private differs: IterableDiffers,
              @Self() @Inject(ROOT_PAGE_DATA) private root: RootPageService, @SkipSelf() @Inject(ROOT_PAGE_DATA) parent: RootPageService
              ) {
    super(viewContainer, template, differs);
  }
  ngAfterContentInit(): void {
    console.log('UiForOfDirective.ngAfterContentInit');
  }
}
