import {ElementRef} from '@angular/core';
import {UIMenu} from '../../shared';

export interface AbstractMenu {
  addChild(child: AbstractMenu): void;
  incCounter(who: AbstractMenu): void;
  decCounter(who: AbstractMenu): void;
  onCounterChange(): void;
  thisRect(): DOMRect;
}
export abstract class AbstractMenuClass implements AbstractMenu {
  protected _counter = 0;
  protected child: AbstractMenu;

  protected constructor(protected parent?: AbstractMenu) {}
  get show(): boolean {
    return this._counter > 0;
  }

  addChild(child: AbstractMenu): void {
    this.child = child;
  }

  incCounter(who: AbstractMenu): void {
    const was = this.show;
    ++this._counter;
    this.checkChanges(was, who);
    if (this.parent) {
      this.parent.incCounter(who);
    }
  }
  decCounter(who: AbstractMenu): void {
    const was = this.show;
    if (--this._counter <= 0) {
      this._counter = 0;
    }
    this.checkChanges(was, who);
    if (this.parent) {
      this.parent.decCounter(who);
    }
  }
  protected checkChanges(was: boolean, who: AbstractMenu): void {
    if (was !== this.show) {
      this.onCounterChange();
      if (who === this) {
        this.callDetectChanges();
      }
    }
  }
  abstract onCounterChange(): void;
  abstract callDetectChanges(): void;
  abstract thisRect(): DOMRect;
}
export interface Menu {
  title: string;
  href: string;
  sub?: UIMenu[];
}
