import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ComponentType, ViewportRuler} from '@angular/cdk/overlay';
import {Subscription} from 'rxjs';
import {IntervalObservableService} from '../interval-observable.service';
import {CdkDataSource, CyclePaging, CycleSlice} from '../shared';
import {CdkTable} from '@angular/cdk/table';


@Component({
  selector: 'lib-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent<T> implements OnInit, OnDestroy {
  @Input() itemTemplate: ComponentType<T> | TemplateRef<T>;
  @Input() cdkDataSource: CdkDataSource<T, any>;
  @Input() showNumberItems = 1;
  @Input() fixCount: boolean;
  @ViewChild(CdkTable, {static: true}) cdkTable: CdkTable<any>;
  allColumns: string[] = ['c0','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'];
  displayedColumns: string[] = [];
  private intervalID: Subscription;
  private subs1: Subscription;
  first = -1;
  cycles = 0;

  private paging: CyclePaging;
  private cycleSlice: CycleSlice<string>;
  constructor(private intervalObservable: IntervalObservableService, private viewportRuler: ViewportRuler) {
    this.subs1 = viewportRuler.change(100).subscribe(() => this.onResize());
  }
  ngOnInit(): void {
    this.cdkDataSource.trIn = (d) => {
        const res = {};
        for (let i = 0; i < this.showNumberItems * 2; ++i) {
          res['с' + i] = d[i];
          this.allColumns.push('с' + i);
          if (i < this.showNumberItems) {
            this.displayedColumns.push('с' + i);
          }
        }
        return [res];
    };
    this.cdkTable.dataSource = this.cdkDataSource;
    this.paging = new CyclePaging(this.cdkTable.viewChange);
    this.paging.pageSize = this.showNumberItems * 2;
    this.cycleSlice = new CycleSlice(this.allColumns, this.showNumberItems);
    this.onResize();
    this.intervalID = this.intervalObservable.scheduler(() => this.refresh(), 5);
  }
  ngOnDestroy(): void {
    this.subs1.unsubscribe();
    if (this.intervalID) {
      this.intervalID.unsubscribe();
    }
  }
  refresh(): void {
    if (this.cycles > 3) {
      this.cycles = 0;
      this.paging.next();
    }
    this.displayedColumns = this.cycleSlice.next();
  }
  private onResize(): void {
    if (!this.fixCount) {
      const width = this.viewportRuler.getViewportSize().width;
      if (width < 449) {
        this.cycleSlice.length = 2;
      } else if (width < 599) {
        this.cycleSlice.length = 3;
      } else if (width < 959) {
        this.cycleSlice.length = 5;
      }
    }
    this.displayedColumns = this.cycleSlice.next();
  }
}
