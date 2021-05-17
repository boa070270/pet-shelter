import {
  AfterContentInit,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren,
  EventEmitter, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {CdkDataSource} from '../shared';
import {Subscription} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';

@Component({
  selector: 'lib-abstract-iterator',
  template: '',
  styleUrls: ['./abstract-iterator.component.css']
})
export class AbstractIteratorComponent<T, U> extends AbstractComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {

  @Input() ds: CdkDataSource<U, T>;
  // @ContentChild(TemplateRef) child: any;
  // @ContentChild(ViewContainerRef) child2: any;
  // @ContentChildren(TemplateRef) children: any;
  // @ContentChildren(ViewContainerRef) children2: any;
  prefix: string;
  data: T[] | ReadonlyArray<T> = null;
  protected readonly collectionViewer;
  private dataSubs: Subscription;
  protected initListRange: ListRange = {start: 0, end: 100};
  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef) {
    super(_view);
    this.collectionViewer = {viewChange: new EventEmitter<ListRange>()};
  }

  ngOnInit(): void {
    if (this.ds) {
      const data = this.ds.connect(this.collectionViewer);
      this.dataSubs = data.subscribe(d => {
        this.data = d;
        this.changeDetector.detectChanges();
      });
      this.collectionViewer.viewChange.emit(this.initListRange);
    }
    // else if (AbstractComponent.isPageData(this.data)) {
    //   this.data = this.rootPage.getData(AbstractComponent.pageDataKey(this.data as string));
    // }
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
