import {Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output} from '@angular/core';
import {LanguageType, MenuService, SYSTEM_LANG_TOKEN, SystemLang, UILogger, UILoggerToken, UIMenu} from '../shared';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-navbar',
  template: `
      <lib-app-bar position="Up" [sticky]="true">
          <div class="ui-navbar">
              <button class="gm-more_vert" (click)="emitter.emit({who: 'sidebar'})"></button>
              <a [routerLink]="'/'">
                  <img src="/assets/img/logo.jpg" class="clip-img">
              </a>
              <div class="ui-navbar-menu">
                  <lib-menu-bar [menu]="menu"></lib-menu-bar>
              </div>
              <label>
                  <span class="gm-language"></span>
                  <select [(ngModel)]="lang">
                      <option *ngFor="let l of languages" [value]="l.lang">{{l.displayName}}</option>
                  </select>
              </label>
              <label>
                  <span class="gm-search"></span>
                  <input type="text" class="navbar-search" [(ngModel)]="value"
                         (change)="emitter.emit({who: 'search', value: value})"
                         (keyup)="emitter.emit({who: 'search', value: $event.target.value})">
              </label>
              <div libUiMenu class="display-flex">
                  <button class="gm-menu" (click)="emitter.emit({who: 'menu'})"></button>
                  <lib-menu [menu]="menu" [bottom]="true"></lib-menu>
              </div>
          </div>
      </lib-app-bar>`,
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnDestroy {
  private subs: Subscription;
  @Input()
  imgSrc: string;
  // get menu(): UIMenu[] {
  //   return this.menuService.menu;
  // }
  @Input() menu: UIMenu[];
  set lang(l: string) {
    this.systemLang.setLocale(l);
  }
  get lang(): string {
    return this.systemLang.getLocale();
  }
  @Output()
  emitter = new EventEmitter<any>();
  languages: LanguageType[];
  value: string;
  constructor(private el: ElementRef, private menuService: MenuService, @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang,
              @Inject(UILoggerToken) private logger: UILogger) {
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
