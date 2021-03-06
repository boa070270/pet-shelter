import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {ActivatedRoute, NavigationEnd, Router, RouterState, UrlSegment} from '@angular/router';
import {SystemLang} from 'ui-lib';
import {PageType} from './common/types';
import {BreadcrumbsComponent} from './common/breadcrumbs.component';
import {Observable, Subscription} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.sass']
})
export class MenuPageComponent implements OnInit, OnDestroy {
  page: PageType;
  path: string[];
  url: string;
  private subscription: Subscription;

  constructor(private service: BasicService, private router: Router) {
    this.subscription = router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
      tap((e) => console.log(e))
    ).subscribe((e) => this.refresh(e as NavigationEnd));
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  refresh(e: NavigationEnd): void {
    if (this.url !== e.urlAfterRedirects) {
      this.url = e.urlAfterRedirects;
      this.path = this.url.substring(1).split('/');
      this.service.getPageMenu(this.path[this.path.length - 1]).subscribe(p => this.page = p);
    }
  }
}
