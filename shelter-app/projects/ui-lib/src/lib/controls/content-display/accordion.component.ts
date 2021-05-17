import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren, ElementRef, forwardRef, Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {AbstractIteratorComponent} from '../abstract-iterator.component';

export interface AccordionData {
  prefix?: string;
  label: string;
  data: string;
}

@Component({
  selector: 'lib-accordion',
  template: `<div class="accordion">
    <ng-container *uiFor="let a of data; index as i">
      <switch-page-data [data]="a" [prefix]="prefix" class="accordion-item">
        <input type="checkbox" name="panel" [id]="i" class="hide">
        <label for="{{i}}" class="accordion-label">{{a.label}}</label>
        <div class="accordion-child">
          {{a.data}}
<!--           <ng-container #container></ng-container>-->
        </div>
      </switch-page-data>
    </ng-container>
  </div>`,
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent<T, U> extends AbstractIteratorComponent<T, U> implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() data: T[] | ReadonlyArray<T> = null;

  // @ContentChild(TemplateRef, {static: true}) child: any;
  // @ContentChild(ViewContainerRef, {static: true}) child2: any;
  // @ContentChildren(TemplateRef, {descendants: true}) children: any;
  // @ContentChildren(ViewContainerRef, {descendants: true}) children2: any;
  @ContentChildren(ElementRef, {descendants: true}) children3: any;
  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view, changeDetector);
  }

  ngOnInit(): void {
    console.log('AccordionComponent.init', this.ds);
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }
  ngAfterViewInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }
}
