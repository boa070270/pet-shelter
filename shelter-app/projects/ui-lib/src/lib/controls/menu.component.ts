import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {SystemLang} from '../i18n';
import {UIMenu} from '../shared';

interface Menu {
  title: string;
  href: string;
  sub?: Menu[];
}
@Component({
  selector: 'lib-menu',
  template: `<nav>
    <ul>
      <li *ngFor="let k of m"><a [routerLink]="k.href">{{k.title}}</a></li>
    </ul>
  </nav>`,
  styleUrls: ['./menu.component.css']
})
export class MenuComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input()
  menu: UIMenu[];
  m: Menu[];
  constructor(systemLang: SystemLang) {
    super(systemLang);
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected onChangeLang(): void {
    super.onChangeLang();
    this.m = this.tr(this.menu);
  }
  private tr(menu: UIMenu[]): Menu[] {
    if (menu) {
      return menu.map(m => {
        return {title: this.doIfNeedI18n(m.title), href: m.href, sub: this.tr(m.sub)};
      });
    }
  }
}
