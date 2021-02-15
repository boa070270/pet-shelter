import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseDataSource, SystemLang} from 'ui-lib';
import {CarouselType} from '../types';
import {BasicService} from '../../basic.service';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ViewportRuler} from '@angular/cdk/overlay';

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
  datasource: BaseDataSource<CarouselType>;
  private langSubs: Subscription;

  constructor(private service: BasicService, private systemLang: SystemLang, private viewportRuler: ViewportRuler) {
    this.langSubs = systemLang.onChange().subscribe(v => {
      if (typeof v === 'string') {
        this.reInitDS();
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubs.unsubscribe();
    this.datasource.close();
  }

  ngOnInit(): void {
    if (!this.resource) {
      throw new Error('The resource is mandatory');
    }
    this.reInitDS();
  }
  private reInitDS(): void {
    let lang = this.lang;
    if (lang === 'auto') {
      lang = this.systemLang.getLocale();
    }
    if (this.datasource) {
      this.datasource.close();
    }
    this.datasource = new CarouselDatasource(this.service, lang, this.resource, this.count);
  }

}
class CarouselDatasource extends BaseDataSource<CarouselType> {
  private offset = 0;
  private isLoaded = false;
  constructor(private service: BasicService, private lang: string, private resource: string, private count: number) {
    super(service.getCarousel(resource, lang, count, 0));
  }
  refresh(): void {
    if (!this.isLoaded) {
      this.isLoaded = true;
      this.offset += this.count;
      this._dataStream.newSource(this.service.getCarousel(this.resource, this.lang, this.count, this.offset).pipe(
        tap((value) => {
          if (value.length < this.count) {
            this.offset = 0;
          }
          this.isLoaded = false;
        })
      ));
    }
  }
}
