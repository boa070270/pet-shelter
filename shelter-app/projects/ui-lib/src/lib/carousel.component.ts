import {Component, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {ComponentType, ViewportRuler} from '@angular/cdk/overlay';
import {UIDataSource} from './ui-types';
import {Subscription} from 'rxjs';
import {IntervalObservableService} from './interval-observable.service';

@Component({
  selector: 'lib-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent<T> implements OnInit, OnDestroy {
  @Input() itemTemplate: ComponentType<T> | TemplateRef<T>;
  @Input() datasource: UIDataSource<T>;
  @Input() showNumberItems = 1;
  @Input() fixCount: boolean;
  numberOfShow: number;
  items: T[] = [];
  allData: T[] = [];
  private subscription: Subscription;
  private intervalID: Subscription;
  private subs1: Subscription;
  position = 0;
  cycles = 0;

  constructor(private intervalObservable: IntervalObservableService, private viewportRuler: ViewportRuler) {
    this.subs1 = viewportRuler.change(100).subscribe(() => this.onResize());
  }
  nextPortion(): void {
    if (this.allData.length > 0) {
      this.items.shift();
      if (this.position >= this.allData.length) {
        this.position = 0;
        this.cycles++;
      }
      const d = this.allData[this.position++];
      if (d) {
        this.items.push(d);
      }
    }
  }
  refresh(immediately?: boolean): void {
    this.nextPortion();
    if (immediately || this.cycles > 5) {
      this.datasource.refresh();
      this.cycles = 0;
    }
  }
  ngOnInit(): void {
    this.onResize();
    this.subscription = this.datasource.select().subscribe(value => {
      if (value.length > 0) {
        if (this.numberOfShow > value.length) {
          this.numberOfShow = value.length;
        }
        this.position = this.numberOfShow;
        this.allData = value;
        this.items = this.allData.slice(0, this.numberOfShow);
      }
    });
    this.intervalID = this.intervalObservable.scheduler(() => this.refresh(), 5);
  }
  ngOnDestroy(): void {
    this.subs1.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.intervalID) {
      this.intervalID.unsubscribe();
    }
  }
  private onResize(): void {
    this.numberOfShow = this.showNumberItems;
    if (!this.fixCount) {
      const width = this.viewportRuler.getViewportSize().width;
      if (width < 449) {
        this.numberOfShow = 2;
      } else if (width < 599) {
        this.numberOfShow = 3;
      } else if (width < 959) {
        this.numberOfShow = 5;
      }
      this.refresh(true);
    }
  }

}
