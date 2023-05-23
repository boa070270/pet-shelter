import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PageType} from './types';
import {BasicService} from '../basic.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {IntervalObservableService} from 'ui-lib';

@Component({
  selector: 'app-card-page',
  templateUrl: './card-page.component.html',
  styleUrls: ['./card-page.component.sass']
})
export class CardPageComponent implements OnInit, OnDestroy {
  @Input() data: PageType;
  @Input() pageId: string;
  @Input() animate = false;
  @Input() interval = 10;
  imgIndex = 0;
  imgSrc: string;
  private subscription: Subscription;
  private intervalSubscription: Subscription;


  constructor(private service: BasicService, private route: ActivatedRoute,
              private intervalObservable: IntervalObservableService) { }

  ngOnInit(): void {
    if (!this.data) {
      const id = this.pageId || this.route.snapshot.paramMap.get('id');
      this.subscription = this.service.getPage(id).subscribe(data => {
        this.data = data;
        this.nextImg();
      });
    } else {
      this.nextImg();
    }
    if (this.animate) {
      this.intervalSubscription = this.intervalObservable.scheduler(() => this.nextImg(), this.interval);
    }
  }
  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  nextImg(): void {
    if (this.data.ref) {
      if (this.imgIndex > this.data.ref.length - 1) {
        this.imgIndex = 0;
      }
      this.imgSrc = '/api/v1/assets/' + this.data.ref[this.imgIndex++].refId;
    }
  }
}
