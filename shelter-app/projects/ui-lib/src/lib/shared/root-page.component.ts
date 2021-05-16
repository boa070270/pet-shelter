import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ROOT_PAGE_DATA, RootPageService} from './services-api';

@Component({
  selector: 'lib-root-page',
  template: '<div #divElement></div>',
  styleUrls: ['./root-page.component.scss']
})
export class RootPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('divElement') div: ElementRef<HTMLDivElement>;
  private pageId: string;
  private html: string;

  constructor(@Inject(ROOT_PAGE_DATA) private rootPage: RootPageService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.pageId = this.route.snapshot.routeConfig.path;
    this.html = this.rootPage.getPageData(this.pageId);
  }

  ngAfterViewInit(): void {
    this.div.nativeElement.innerHTML = this.html;
  }

  ngOnDestroy(): void {
    this.rootPage.flushPageData();
  }

}
