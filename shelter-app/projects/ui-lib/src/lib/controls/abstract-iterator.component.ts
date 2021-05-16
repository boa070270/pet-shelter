import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
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
export class AbstractIteratorComponent<T, U> extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  @Input() ds: CdkDataSource<U, T>;
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
    const data = this.ds.connect(this.collectionViewer);
    this.dataSubs = data.subscribe(d => {
      this.data = d;
      this.changeDetector.detectChanges();
    });
    this.collectionViewer.viewChange.emit(this.initListRange);
  }
  ngOnChanges(changes: SimpleChanges): void {
    const v = changes.ds;
    if (v && AbstractComponent.isPageData(v.currentValue)) {
      this.prefix = AbstractComponent.pageDataKey(v.currentValue);
    }
    super.ngOnChanges(changes);
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
