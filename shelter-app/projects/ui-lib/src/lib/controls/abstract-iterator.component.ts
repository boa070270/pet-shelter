import {
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Inject,
  Input, OnChanges, OnDestroy,
  OnInit,
  Optional,
  SimpleChanges, ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {SystemLang} from '../i18n';
import {CdkDataSource, I18NType, RootPageService} from '../shared';
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
  constructor(protected view: ViewContainerRef, public systemLang: SystemLang, protected rootPage: RootPageService,
              protected changeDetector: ChangeDetectorRef,
              @Optional() @Inject('i18NCfg') public i18NCfg?: I18NType) {
    super(view.injector.get(SystemLang), view.injector.get(RootPageService), i18NCfg);
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
