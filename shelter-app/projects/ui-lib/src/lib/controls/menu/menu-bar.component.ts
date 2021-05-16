import {Component, Input, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {UIMenu} from '../../shared';
import {AbstractComponent} from '../abstract.component';

@Component({
  selector: 'lib-menu-bar',
  template:
    `<table #table class="ui-menu-button-container"><tr><td libUiMenu *ngFor="let m of _menu">
      <button [routerLink]="m.href" class="ui-menu-button">{{m.title}}</button>
      <lib-menu [menu]="m.sub" *ngIf="m.sub && m.sub.length > 0" [bottom]="true" class="pos-beside"></lib-menu>
    </td></tr></table>`,
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input()
  menu: UIMenu[];
  _menu: Array<{title: string, href?: string, sub: UIMenu[]}> = [];
  // get display(): boolean {
  //   const elm = this.tbl.nativeElement;
  //   const host = this.host.nativeElement.getBoundingClientRect();
  //   return host.width < elm.clientWidth;
  // }
  // @ViewChild('table', {static: true}) tbl: ElementRef<HTMLTableElement>;
  constructor(protected _view: ViewContainerRef) {
    super(_view);
  }
  ngOnInit(): void {
    this.onChangeLang();
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  protected onChangeLang(): void {
    super.onChangeLang();
    if (this.menu) {
      this._menu = this.menu.map(v => ({title: this.doIfNeedI18n(v.title), href: v.href, sub: v.sub}));
    }
  }
}
