import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RootPageService} from "./root-page.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'lib-root-page',
  template: '<div #divElement></div>',
  styleUrls: ['./root-page.component.scss']
})
export class RootPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('divElement') div: ElementRef<HTMLDivElement>;
  private pageId: string;
  private html: string;

  constructor(private rootPage: RootPageService,
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
