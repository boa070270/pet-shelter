import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SYSTEM_LANG_TOKEN, SystemLang} from 'ui-lib';
import {SystemMenuService} from '../system-menu.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.sass']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  @Input() urls: string[] = [];
  titles: string[];
  private subscription: Subscription;

  constructor(@Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang, private systemMenu: SystemMenuService) {
    this.subscription = systemLang.onChange().subscribe(v => {
      if (typeof v === 'string') {
        this.refreshTitles();
      }
    });
  }

  ngOnInit(): void {
    this.refreshTitles();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refreshTitles(): void {
    const titles = this.urls.map( u => this.systemMenu.menusAndTitle.titles.filter(f => f.id = u));
    this.titles = titles.map(t => this.systemLang.getTitle(t));
  }

}
