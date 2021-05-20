import {
  AfterContentInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren, Directive, ElementRef,
  EventEmitter, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Self,
  SimpleChanges, TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {CdkDataSource} from '../shared';
import {Subscription} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

export interface ContentContainer {
  projectableNodes: Node[][];
}

@Directive({
  selector: '[libIterator]'
  })
export class IteratorDirective implements ContentContainer {
  projectableNodes: Node[][];
}

const MARK = 'AbstractIteratorComponent';
@Component({
  selector: 'lib-abstract-iterator',
  template: '',
  styleUrls: ['./abstract-iterator.component.css']
})
export class AbstractIteratorComponent<T, U> extends AbstractComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {
  protected projection: Node[][];
  protected get __mark__(): string { return MARK; }
  @Input() ds: CdkDataSource<U, T>;
  prefix: string;
  data: T[] | ReadonlyArray<T>;
  // get data(): T[] | ReadonlyArray<T> {
  //   return this._data;
  // }
  iteratorDirective: IteratorDirective;
  protected readonly collectionViewer;
  private dataSubs: Subscription;
  protected initListRange: ListRange = {start: 0, end: 100};
  static isAbstractIteratorComponent(c: any): boolean {
    return c && (typeof (c as any).isAbstractIteratorComponent === 'function' || (c as any).__mark__ === MARK);
  }

  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view);
    this.collectionViewer = {viewChange: new EventEmitter<ListRange>()};
    this.projection = (this._view as any)._hostTNode.projection;
  }

  ngOnInit(): void {
    this.iteratorDirective.projectableNodes = this.projection;
    if (this.ds) {
      const data = this.ds.connect(this.collectionViewer);
      this.dataSubs = data.subscribe(d => {
        this.data = d;
        this.changeDetector.detectChanges();
      });
      this.collectionViewer.viewChange.emit(this.initListRange);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    const v = changes.ds;
    if (v && AbstractComponent.isPageData(v.currentValue)) {
      this.prefix = AbstractComponent.pageDataKey(v.currentValue);
    }
    super.ngOnChanges(changes);
  }
  ngAfterContentInit(): void {
    // console.log(this.child, this.child2, this.children, this.children2);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.dataSubs !== null) {
      this.ds.disconnect(this.collectionViewer);
      this.dataSubs.unsubscribe();
    }
    this.collectionViewer.viewChange.complete();
  }
}
