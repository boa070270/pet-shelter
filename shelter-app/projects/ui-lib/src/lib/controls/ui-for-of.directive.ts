import {
  AfterContentInit,
  Directive,
  DoCheck, Input,
  IterableDiffers,
  NgIterable,
  Self,
  SkipSelf,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {NgForOf, NgForOfContext} from '@angular/common';
import {RootPageService} from '../shared';

@Directive({
  selector: '[uiFor][uiForOf]',
  providers: [
    {provide: RootPageService, useClass: RootPageService}
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
              @Self() private root: RootPageService, @SkipSelf() parent: RootPageService
              ) {
    super(viewContainer, template, differs);
  }
  ngAfterContentInit(): void {
    console.log('UiForOfDirective.ngAfterContentInit');
  }
}
