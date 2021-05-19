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
import {AbstractIteratorComponent, IteratorDirective} from '../abstract-iterator.component';
import {AbstractComponent} from "../abstract.component";

export interface AccordionData {
  prefix?: string;
  label: string;
  data: string;
}

@Component({
  selector: 'lib-accordion',
  template: `<div class="accordion" libIterator>
    <ng-container *ngFor="let a of data; index as i">
      <div class="accordion-item">
        <input type="checkbox" name="panel" [id]="i" class="hide">
        <label for="{{i}}" class="accordion-label">{{a[label]}}</label>
        <div class="accordion-child">
          {{a.data}}
          <div switch-page-data [data]="a" [prefix]="prefix" [index]="i"></div>
        </div>
      </div>
    </ng-container>
  </div>`,
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent<T, U> extends AbstractIteratorComponent<T, U> implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input()
  data: T[] | ReadonlyArray<T>;
  // set data(d: T[] | ReadonlyArray<T>) {
  //   this._data = d;
  // }
  @Input() label: string = '';
  @ViewChild(IteratorDirective, {static: true}) iterDirective: IteratorDirective;
  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view, changeDetector);
  }

  ngOnInit(): void {
    console.log('AccordionComponent.init', this.ds);
    this.iteratorDirective = this.iterDirective;
    this.label = AbstractComponent.pageDataKey(this.label);
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }
  ngAfterViewInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }
}
