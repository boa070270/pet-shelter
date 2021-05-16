import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractDataSource, CdkDataSource, IFilter, SYSTEM_LANG_TOKEN, SystemLang} from 'ui-lib';
import {CarouselType} from '../types';
import {Subscription} from 'rxjs';
import {ViewportRuler} from '@angular/cdk/overlay';
import {DataSources} from '../../datasources';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.sass']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() resource: string;
  @Input() lang: string;
  @Input() count: number;
  @Input() fixCount: boolean;
  cdkDataSource: CdkDataSource<CarouselType, {[key: string]: CarouselType}>;

  private langSubs: Subscription;

  constructor(private dataSources: DataSources, @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang, private viewportRuler: ViewportRuler) {
    this.langSubs = systemLang.onChange().subscribe(v => {
      if (typeof v === 'string') {
        this.setFilter();
      }
    });
    this.cdkDataSource = dataSources.Carousel.registerDS();
  }

  ngOnDestroy(): void {
    this.langSubs.unsubscribe();
    this.dataSources.Carousel.unregisterDS(this.cdkDataSource);
  }

  ngOnInit(): void {
    if (!this.resource) {
      throw new Error('The resource is mandatory');
    }
    this.setFilter();
  }
  private setFilter(): void {
    if (this.lang) {
      let lang = this.lang;
      if (lang === 'auto') {
        lang = this.systemLang.getLocale();
      }
      const filter: IFilter = {external: {lang, resource: this.resource}};
      this.cdkDataSource.filter(filter);
    }
  }

}
