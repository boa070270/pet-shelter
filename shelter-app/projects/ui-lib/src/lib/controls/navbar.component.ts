import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MenuService, UIMenu} from '../shared';

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
      <span class="gm-search"></span>
      <input #inputSearch type="text" class="navbar-search" (change)="emitter.emit('search')">
      <span></span>
    </label>
    <button class="gm-more_horiz" (click)="emitter.emit('menu')"></button>
  </div>`,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  get menu(): UIMenu[] {
    return this.menuService.menu;
  }
  @Output()
  emitter = new EventEmitter<any>();
  constructor(private menuService: MenuService) {
  }

}
