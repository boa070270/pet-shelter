import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren, ElementRef, forwardRef, Host, Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {AbstractIteratorComponent, IteratorDirective} from '../abstract-iterator.component';

export interface AccordionData {
  prefix?: string;
  label: string;
  data: string;
}

@Component({
  selector: 'lib-accordion',
  template: `<div class="accordion" libIterator>
    <ng-container *ngFor="let a of data; index as i">
        <input type="checkbox" name="panel" [id]="i" class="hide">
        <label for="{{i}}" class="accordion-label">{{a.label}}</label>
        <div class="accordion-child">
          {{a.data}}
          <div switchPageData [data]="a" [prefix]="prefix" [index]="i"></div>
        </div>
    </ng-container>
  </div>`,
  styleUrls: ['./accordion.component.scss'],
//      <switch-page-data [data]="a" [prefix]="prefix" class="accordion-item">
})
export class AccordionComponent<T, U> extends AbstractIteratorComponent<T, U> implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  // @Input() data: T[] | ReadonlyArray<T> = null;
  @ViewChild(IteratorDirective, {static: true}) iterDirective: IteratorDirective;
  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view, changeDetector);
  }

  ngOnInit(): void {
    console.log('AccordionComponent.init', this.ds);
    this.iteratorDirective = this.iterDirective;
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }
  ngAfterViewInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }
}
