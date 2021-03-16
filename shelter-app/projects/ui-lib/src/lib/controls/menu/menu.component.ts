import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  SkipSelf
} from '@angular/core';
import {SystemLang} from '../../i18n';
import {UiMenuDirective} from './ui-menu.directive';
import {AbstractMenu, AbstractMenuClass, Menu} from './abstract-menu';
import {ViewportRuler} from '@angular/cdk/overlay';
import {UIMenu} from '../../shared';
import {AbstractComponent} from '../abstract.component';

class AbstractMenuWrap extends AbstractMenuClass {
  constructor(protected parent: AbstractMenu, protected element: ElementRef,
              private onChange: () => void, private detectChange: () => void) {
    super(parent);
  }
  callDetectChanges(): void {
    this.detectChange();
  }
  thisRect(): DOMRect {
    return this.element.nativeElement.getBoundingClientRect();
  }
  onCounterChange(): void {
    this.onChange();
  }
}

@Component({
  selector: 'lib-menu',
  template: `
      <ul libUiMenu class="menu-panel" role="menu">
        <li libUiMenu class="example-menu-item" *ngFor="let m of _menu" [routerLink]="m.href">
          {{m.title}}
          <lib-menu [menu]="m.sub" *ngIf="m.sub && m.sub.length > 0" class="pos-beside"></lib-menu>
        </li>
      </ul>
  `,
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent extends AbstractComponent implements OnInit, OnDestroy, AbstractMenu {
  @Input()
  menu: UIMenu[];
  _menu: Menu[];
  @Input() @HostBinding('class.pos-bottom')
  bottom: boolean;
  menuCounter: AbstractMenuWrap;
  @HostBinding('style')
  visibility = 'visibility: collapse;';

  constructor(public systemLang: SystemLang,
              protected element: ElementRef,
              @Optional() @SkipSelf() protected parent: UiMenuDirective,
              protected viewPort: ViewportRuler,
              protected changeDetector: ChangeDetectorRef) {
    super(systemLang);
    this.menuCounter = new AbstractMenuWrap(parent, element, () => { this.onCounterChange(); },
      () => { this.changeDetector.detectChanges(); });
    if (this.parent) {
      this.parent.addChild(this);
    }
  }
  onCounterChange(): void {
    if (this.menuCounter.show) {
      this.visibility = 'visibility: visible;' + this.calcPosition();
    } else {
      this.visibility = 'visibility: collapse;';
    }
  }
  incCounter(who: AbstractMenu): void {
    this.menuCounter.incCounter(who);
  }
  decCounter(who: AbstractMenu): void {
    this.menuCounter.decCounter(who);
  }
  get show(): boolean {
    return this.menuCounter.show;
  }
  thisRect(): DOMRect {
    return this.menuCounter.thisRect();
  }
  ngOnInit(): void {
    this.onChangeLang();
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  protected onChangeLang(): void {
    super.onChangeLang();
    this._menu = this.tr(this.menu);
  }
  private tr(menu: UIMenu[]): Menu[] {
    if (menu) {
      return menu.map(m => ({href: m.href, title: this.doIfNeedI18n(m.title), sub: this.tr(m.sub)}));
    }
    return null;
  }
  addChild(child: AbstractMenu): void {
  }
  calcPosition(): string {
      const r = this.parent.thisRect();
      const tr = this.thisRect();
      let position;
      if (this.bottom) {
        position = `top:${r.bottom}px;`;
      } else {
        position = `top:calc(${r.top}px + 0.3em);`;
      }
      if (Math.ceil(tr.width) + Math.ceil(r.right) + 12 < this.viewPort.getViewportRect().right) {
        if (!this.bottom) {
          position = position + `left:${r.right + 2}px;`;
        }
      } else {
        if (this.bottom) {
          position = position + `left:${r.right - tr.width - 2}px;`;
        } else {
          position = position + `left:${r.left - tr.width - 2}px;`;
        }
      }
      return position;
  }
}
