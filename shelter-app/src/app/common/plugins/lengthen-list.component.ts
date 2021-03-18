import {AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {SearchType} from '../types';
import {IsVisibleDirective} from 'ui-lib';
import {Subscription} from 'rxjs';
import {BasicService} from '../../basic.service';
import {SystemLang} from 'ui-lib';

@Component({
  selector: 'app-lengthen-list',
  templateUrl: './lengthen-list.component.html',
  styleUrls: ['./lengthen-list.component.sass']
})
export class LengthenListComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() resource: string; // all, page, pet, asset
  @Input() query: string;
  @Input() displayAs: string;
  @Input() defLang: string; // auto, one of lang or empty
  @ViewChild(IsVisibleDirective) isVisibleDirective: IsVisibleDirective;
  canBeLoaded: boolean;
  index: string;
  lang: string;
  totals: number;
  lastQuery: number;
  private isVisibleSubs: Subscription;
  searchResult: Array<SearchType[]> = [];
  size = 12;

  constructor(private service: BasicService,
              private  systemLang: SystemLang) {
  }

  ngOnInit(): void {
    this.canBeLoaded = true;
    this.refresh();
  }
  ngAfterViewInit(): void {
    if (this.isVisibleDirective) {
      this.isVisibleSubs = this.isVisibleDirective.change().subscribe(isVisible => {
        if (isVisible) {
          this.next();
        }
      });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.resource && changes.resource.currentValue !== changes.resource.previousValue) {
      this.refresh();
      this.next();
    }
  }
  ngOnDestroy(): void {
    if (this.isVisibleSubs) {
      this.isVisibleSubs.unsubscribe();
    }
  }
  private refresh(): void {
    this.index = this.resource;
    if (this.resource === 'all') {
      this.index = null;
    }
    if (this.resource === 'page' && this.defLang === 'auto') {
      this.lang = this.systemLang.getLocale();
    }
    this.searchResult = [];
    this.totals = 100;
    this.lastQuery = 0;
  }

  private next(): void {
    if (this.canBeLoaded) {
      this.canBeLoaded = false;
      const obtained = this.searchResult.length * this.size;
      if (obtained >= this.totals && (this.lastQuery > Date.now() - 120000) ) { // wait 2 min if all data was obtained
        this.canBeLoaded = true;
        return;
      }
      this.service.search(this.index, this.lang, this.query, this.size, this.searchResult.length * this.size).subscribe(data => {
        if (data) {
          if (data.data.length > 0) {
            this.searchResult.push(data.data);
          }
          this.lastQuery = Date.now();
          this.totals = data.total;
          this.canBeLoaded = true;
        }
      });
    }
  }

}
