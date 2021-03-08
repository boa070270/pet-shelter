import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UIMenu} from '../../shared';
import {AbstractComponent} from '../abstract.component';
import {SystemLang} from '../../i18n';

@Component({
  selector: 'lib-menu-item',
  template: `
    <button cdkMenuItem [cdkMenuTriggerFor]="tmpl" [routerLink]="menu.href" class="example-standalone-item" *ngIf="menu.sub; else simple">{{title}}</button>
    <ng-template #simple>
      <button cdkMenuItem class="example-standalone-item">{{}}</button>
    </ng-template>
    <ng-template #tmpl>
      <lib-menu [menu]="menu.sub"></lib-menu>
    </ng-template>
  `,
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input()
  menu: UIMenu;
  title: string;
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
    this.title = this.doIfNeedI18n(this.menu.title);
  }

}
