import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {SystemLang} from '../../i18n';
import {UIMenu} from '../../shared';

interface Menu {
  title: string;
  href: string;
  sub?: Menu[];
}
@Component({
  selector: 'lib-menu',
  template: `
    <button cdkMenuItem [cdkMenuTriggerFor]="_tmpl" class="example-standalone-item">Click me!</button>
    <ng-template cdkMenuPanel #_tmpl="cdkMenuPanel">
      <div class="example-menu" cdkMenu [cdkMenuPanel]="_tmpl">
        <button class="example-menu-item" cdkMenuItem *ngFor="let m of menu" [routerLink]="m.href">{{m.title}}</button>
      </div>
    </ng-template>

  `,
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input()
  menu: UIMenu[];
  @Input()
  showTop: boolean = false;
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
