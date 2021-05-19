import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  HostBinding, Inject,
  Input, OnChanges,
  OnInit, SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AbstractIteratorComponent, IteratorDirective} from "../abstract-iterator.component";
import {AbstractComponent} from "../abstract.component";
import {ROOT_PAGE_DATA, RootPageService, RootPageServiceImpl} from "../../shared";
import {deepCloneNode} from "../../editor/clone-node";

export interface TabType {
  label: string;
  data?: string;
}

@Component({
  selector: 'lib-tab-group',
  template: `
    <div class="tab-group" libIterator>
      <ng-container></ng-container>
      <div class="group-header" #buttons>
        <button *ngFor="let tab of data; index as i" (click)="changeTab(tab, i)"
                [ngClass]="{'tab-chosen' : chosen === i}">{{(tab[label]) ? tab[label] : label}}</button>
      </div>
      <div *ngIf="tabContent.children.length === 0">{{tabData}}</div>
      <div class="group-content" #tabContent>
<!--        <ng-content></ng-content>-->
      </div>
    </div>`,
  styleUrls: ['./tab-group.component.scss'],
  // providers: [
  //   {provide: ROOT_PAGE_DATA, useClass: RootPageServiceImpl}
  // ]
})
export class TabGroupComponent<T extends TabType> extends AbstractIteratorComponent<any, any> implements OnInit, AfterViewInit, OnChanges {

  @Input()
  data: T[] | ReadonlyArray<T>;
  // set data(d: T[] | ReadonlyArray<T>) {
  //   this._data = d;
  // }
  @Input() label: string = 'label';
  @ViewChild('tabContent') tabElements: ElementRef<HTMLDivElement>;
  @ViewChild(IteratorDirective, {static: true}) iterDirective: IteratorDirective;
  get tabsEl(): NodeListOf<HTMLElement> {
    return this.tabElements.nativeElement.querySelectorAll('lib-tab');
  }
  tabData;
  chosen: number = 0;

  constructor(protected _view: ViewContainerRef,
              protected changeDetector: ChangeDetectorRef,
              @Inject(ROOT_PAGE_DATA) protected root: RootPageService) {
    super(_view, changeDetector);
  }

  ngOnInit(): void {
    this.iteratorDirective = this.iterDirective;
    super.ngOnInit();
    if (this.ds) {
      this.label = AbstractComponent.pageDataKey(this.label);
      this.setData();
      this.drawChildren();
    } else if (this.data) {
      if (this.tabElements.nativeElement.children.length === 0) {
        this.setData();
      } else {
        this.tabData = this.data[0].data;
      }
    }
  }

  ngAfterViewInit(): void {
     if (!this.data) {
      const data = [];
      let i = 0;
      this.tabsEl.forEach(e => {
        if (!e.classList.contains('tab-content')) {
          e.classList.add('tab-content');
        }
        data.push({label: e.attributes.getNamedItem('label').value});
        const id = document.createAttribute('_id');
        id.value = i++ + '';
        e.attributes.setNamedItem(id);
        if (i > 1) {
          e.hidden = true;
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const v = changes.data;
    if (v && AbstractComponent.isPageData(v.currentValue)) {
      this.prefix = AbstractComponent.pageDataKey(v.currentValue);
    }
    super.ngOnChanges(changes);
  }

  changeTab(tab: TabType, index: number): void {
    this.chosen = index;
    if (this.data) {
      this.setData();
      this.drawChildren();
    } else if (tab.data) {
      this.tabData = tab.data;
    } else {
      this.tabsEl.forEach(e => {
        e.hidden = e.attributes.getNamedItem('_id').value !== index + '';
      });
    }
  }

  private drawChildren(): void {
    if (this.iteratorDirective.projectableNodes && this.iteratorDirective.projectableNodes.length > 0) {
      const e: HTMLElement = this.tabElements.nativeElement;
      e.innerHTML = '';
      this.iteratorDirective.projectableNodes.forEach(
        a => a.forEach(n => e.appendChild(deepCloneNode(n as HTMLElement)))
      );
    }
  }

  private setData(): void {
    if (this.data && this.prefix) {
      Object.keys(this.data[this.chosen]).forEach(k => {
        const key = (this.prefix ? this.prefix + '.' : '') + k;
        this.root.setData(key, this.data[this.chosen][k]);
      });
      this.root.setData(this.prefix + '#index', this.chosen);
    }
  }

}

@Directive({
  selector: 'lib-tab'
})
export class TabDirective {
  @HostBinding() class = 'tab-content';
  @Input() label;
}
