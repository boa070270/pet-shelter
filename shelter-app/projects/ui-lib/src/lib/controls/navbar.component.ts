import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {LanguageType, MenuService, UIMenu} from '../shared';
import {SystemLang} from '../i18n';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-navbar',
  template: `<div class="ui-navbar">
    <button class="gm-more_vert" (click)="emitter.emit('sidebar')"></button>
    <a [routerLink]="'/'">
      <img src="/assets/img/logo.jpg" class="clip-img">
    </a>
    <div class="ui-navbar-menu">
        <lib-menu [menu]="menu"></lib-menu>
    </div>
    <label>
      <span class="gm-language"></span>
      <select [value]="lang">
        <option *ngFor="let l of languages" [value]="l.lang">{{l.displayName}}</option>
      </select>
    </label>
    <label>
      <span class="gm-search"></span>
      <input #inputSearch type="text" class="navbar-search" (change)="emitter.emit('search')">
    </label>
    <button class="gm-menu" (click)="emitter.emit('menu')"></button>
  </div>`,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnDestroy {
  private subs: Subscription;
  get menu(): UIMenu[] {
    return this.menuService.menu;
  }
  set lang(l: string) {
    this.systemLang.setLocale(l);
  }
  get lang(): string {
    return this.systemLang.getLocale();
  }
  @Output()
  emitter = new EventEmitter<any>();
  languages: LanguageType[];
  constructor(private menuService: MenuService, private systemLang: SystemLang) {
    this.languages = systemLang.getLanguages();
    this.subs = systemLang.onChange().subscribe(l => {
      if (typeof l === 'object') {
        this.languages = systemLang.getLanguages();
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
