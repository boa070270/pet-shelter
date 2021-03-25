import {
  Component,
  EventEmitter,
  Inject,
  Input, NgZone,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {CdkDataSource, I18NType, IntervalObservableService} from '../../shared';
import {AbstractComponent} from '../abstract.component';
import {SystemLang} from '../../i18n';
import {SlideContainerDirective} from './slide-container.directive';
import {ListRange} from '@angular/cdk/collections';
import {Subscription} from 'rxjs';
import {dashCaseToCamelCase} from "@angular/compiler/src/util";


@Component({
  selector: 'lib-carousel',
  template: `<div class="slide-container" libSlideContainer>
    <div libSlideElement *ngFor="let item of data">
      <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="item"></ng-template>
    </div>
    <button class="gm-chevron_left btn btn-left" (click)="slideContainer.prev()"></button>
    <button class="gm-chevron_right btn btn-right" (click)="slideContainer.next()"></button>
  </div>`,
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent<T, U> extends AbstractComponent implements OnInit, OnDestroy {
  @Input() itemTemplate: TemplateRef<T>;
  @Input() cdkDataSource: CdkDataSource<U, T>;
  @ViewChild(SlideContainerDirective, {static: true}) slideContainer: SlideContainerDirective;
  private readonly collectionViewer;
  data: T[] | ReadonlyArray<T> = null;
  start = 0;
  private dataSubs: Subscription;
  constructor(public systemLang: SystemLang, private intervalObserver: IntervalObservableService,
              @Optional() @Inject('i18NCfg') public i18NCfg?: I18NType) {
    super(systemLang, i18NCfg);
    this.collectionViewer = {viewChange: new EventEmitter<ListRange>()};
    this.intervalObserver.scheduler( () => this.updateData(), 10);
  }
  ngOnInit(): void {
    const data = this.cdkDataSource.connect(this.collectionViewer);
    this.dataSubs = data.subscribe(d => this.data = d);
    this.collectionViewer.viewChange.emit({start: this.start, end: this.start + 10});
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.dataSubs !== null) {
      this.cdkDataSource.disconnect(this.collectionViewer);
      this.dataSubs.unsubscribe();
    }
    this.collectionViewer.viewChange.complete();
  }

  private updateData(): void {
    if (this.data.length === 10) {
      this.start += 10;
    } else {
      this.start = 0;
    }
    this.collectionViewer.viewChange.emit({start: this.start, end: 10});
  }
}
