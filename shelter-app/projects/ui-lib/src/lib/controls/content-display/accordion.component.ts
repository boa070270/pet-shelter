import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren, ElementRef, forwardRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {AbstractIteratorComponent} from '../abstract-iterator.component';

@Component({
  selector: 'lib-accordion',
  template: `<div class="accordion">
    <ng-container *uiFor="let a of data">
      <switch-page-data [data]="a" [prefix]="prefix">
        <input type="checkbox" name="panel" [id]="a.id">
        <label for="a.id">{{a.label}}</label>
        <div class="accordion-content">
          {{a.data}}
          <!-- ng-content></ng-content -->
        </div>
      </switch-page-data>
    </ng-container>
  </div>`,
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent<T, U> extends AbstractIteratorComponent<T, U> implements OnInit, OnChanges, OnDestroy, AfterViewInit {
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
    const v = changes.accs;
    if (v && AbstractComponent.isPageData(v.currentValue)) {
      this.prefix = AbstractComponent.pageDataKey(v.currentValue);
    }
    super.ngOnChanges(changes);
  }
  ngAfterViewInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }
}
