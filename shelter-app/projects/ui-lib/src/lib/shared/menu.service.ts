import {EventEmitter, Injectable} from '@angular/core';
import {TitleType} from './language';

export interface UIMenu {
  title: string | TitleType[];
  href: string;
  sub?: UIMenu[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private topMenu: UIMenu[];
  set menu(m: UIMenu[]) {
    this.topMenu = m;
    this.menuChanges.emit(true);
  }
  get menu(): UIMenu[] {
    return this.topMenu;
  }
  menuChanges = new EventEmitter<any>();
  constructor() { }
}
