import {
  AfterContentChecked,
  Attribute,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';
import {
  _COALESCED_STYLE_SCHEDULER,
  _CoalescedStyleScheduler,
  CdkTable,
  RenderRow,
  RowContext,
} from '@angular/cdk/table';
import {Directionality} from '@angular/cdk/bidi';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {_VIEW_REPEATER_STRATEGY, _ViewRepeater, CollectionViewer} from '@angular/cdk/collections';

@Component({
  selector: 'lib-table-cdk',
  templateUrl: './table-cdk.component.html',
  styleUrls: ['./table-cdk.component.css']
})
export class TableCdkComponent<T> extends CdkTable<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {

  constructor(protected readonly _differs: IterableDiffers,
              protected readonly _changeDetectorRef: ChangeDetectorRef,
              protected readonly _elementRef: ElementRef, @Attribute('role') role: string,
              @Optional() protected readonly _dir: Directionality, @Inject(DOCUMENT) _document: any,
              _platform: Platform,

              /**
               * @deprecated `_coalescedStyleScheduler`, `_viewRepeater` and `_viewportRuler`
               *    parameters to become required.
               * @breaking-change 11.0.0
               */
              @Optional() @Inject(_VIEW_REPEATER_STRATEGY)
              protected readonly _viewRepeater?: _ViewRepeater<T, RenderRow<T>, RowContext<T>>,
              @Optional() @Inject(_COALESCED_STYLE_SCHEDULER)
              protected readonly _coalescedStyleScheduler?: _CoalescedStyleScheduler) {
    super(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, _platform,
      _viewRepeater, _coalescedStyleScheduler);
  }

  ngOnInit(): void {
  }

}
