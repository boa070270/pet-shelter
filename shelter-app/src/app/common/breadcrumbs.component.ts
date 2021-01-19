import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SystemLang} from 'ui-lib';
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

  constructor(private systemLang: SystemLang, private systemMenu: SystemMenuService) {
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
    this.titles = this.urls.map( u => this.systemMenu.getTitle(u));
  }

}
