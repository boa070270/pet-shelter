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
import {AbstractIteratorComponent, IteratorDirective} from "../abstract-iterator.component";


@Component({
  selector: 'lib-carousel',
  template: `<div class="slide-container" libSlideContainer libIterator>
    <div libSlideElement *ngFor="let item of data; index as i" class="slide-element">
      <div switch-page-data [data]="item" [prefix]="prefix" [index]="i"></div>
    </div>
  </div>
  <button class="gm-chevron_left btn btn-left" (click)="slideContainer.prev()"></button>
  <button class="gm-chevron_right btn btn-right" (click)="slideContainer.next()"></button>
  `,
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent<T, U> extends AbstractIteratorComponent<T, U> implements OnInit, OnDestroy {
  @Input() itemTemplate: TemplateRef<T>;
  @ViewChild(SlideContainerDirective, {static: true}) slideContainer: SlideContainerDirective;
  @ViewChild(IteratorDirective, {static: true}) iterDirective: IteratorDirective;
  start = 0;
  private cycle = 0;
  private interval: Subscription;
  constructor(protected _view: ViewContainerRef,
              private intervalObserver: IntervalObservableService,
              protected changeDetector: ChangeDetectorRef) {
    super(_view, changeDetector);
    this.interval = this.intervalObserver.scheduler( () => this.updateData(), 10);
  }
  ngOnInit(): void {
    this.iteratorDirective = this.iterDirective;
    super.ngOnInit();
  }
  ngOnDestroy(): void {
    this.interval.unsubscribe();
    super.ngOnDestroy();
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
