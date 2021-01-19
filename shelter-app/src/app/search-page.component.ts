import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BasicService} from './basic.service';
import {SearchType} from './common/types';
import {SystemLang} from 'ui-lib';
import {IsVisibleDirective} from 'ui-lib';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SearchPageComponent implements OnInit {
  query: string;
  queryOut: string;
  private size = 20;
  place: string;
  displayAs: string;

  constructor(private route: ActivatedRoute, private service: BasicService,
              private  systemLang: SystemLang) { }

  ngOnInit(): void {
    this.displayAs = 'card';
    if (!this.place) {
      this.place = 'all';
    }
    this.query = this.route.snapshot.paramMap.get('query');
    this.queryOut = this.query;
  }

  switchToCard(): void {
    this.displayAs = 'card';
  }

  switchToTablet(): void {
    this.displayAs = 'tablet';
  }

  clickSearch(): void {
    this.queryOut = this.query;
  }
}
