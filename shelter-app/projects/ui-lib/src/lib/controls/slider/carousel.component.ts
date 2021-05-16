import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CdkDataSource, IntervalObservableService} from '../../shared';
import {AbstractComponent} from '../abstract.component';
import {SlideContainerDirective} from './slide-container.directive';
import {ListRange} from '@angular/cdk/collections';
import {Subscription} from 'rxjs';


@Component({
  selector: 'lib-carousel',
  template: `<div class="slide-container" libSlideContainer>
    <div libSlideElement *ngFor="let item of data" class="slide-element">
      <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{$implicit:item}"></ng-template>
    </div>
  </div>
  <button class="gm-chevron_left btn btn-left" (click)="slideContainer.prev()"></button>
  <button class="gm-chevron_right btn btn-right" (click)="slideContainer.next()"></button>
  `,
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent<T, U> extends AbstractComponent implements OnInit, OnDestroy {
  @Input() itemTemplate: TemplateRef<T>;
  @Input() cdkDataSource: CdkDataSource<U, T>; // {{ds1}}
  @ViewChild(SlideContainerDirective, {static: true}) slideContainer: SlideContainerDirective;
  private readonly collectionViewer;
  data: T[] | ReadonlyArray<T> = null;
  start = 0;
  private cycle = 0;
  private dataSubs: Subscription;
  private interval: Subscription;
  constructor(protected _view: ViewContainerRef,
              private intervalObserver: IntervalObservableService,
              protected changeDetector: ChangeDetectorRef) {
    super(_view);
    this.collectionViewer = {viewChange: new EventEmitter<ListRange>()};
    this.interval = this.intervalObserver.scheduler( () => this.updateData(), 10);
  }
  ngOnInit(): void {
    const data = this.cdkDataSource.connect(this.collectionViewer);
    this.dataSubs = data.subscribe(d => {
      this.data = d;
      this.changeDetector.detectChanges();
    });
    this.collectionViewer.viewChange.emit({start: this.start, end: this.start + 10});
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.interval.unsubscribe();
    if (this.dataSubs !== null) {
      this.cdkDataSource.disconnect(this.collectionViewer);
      this.dataSubs.unsubscribe();
    }
    this.collectionViewer.viewChange.complete();
  }

  private updateData(): void {
    if (this.cycle++ < 40) {
      this.slideContainer.next();
      this.changeDetector.detectChanges();
      return;
    }
    this.cycle = 0;
    if (this.data && this.data.length === 10) {
      this.start += 10;
    } else {
      this.start = 0;
    }
    this.collectionViewer.viewChange.emit({start: this.start, end: 10});
  }
}
