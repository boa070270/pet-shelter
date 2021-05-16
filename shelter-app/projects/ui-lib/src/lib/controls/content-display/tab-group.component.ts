import {AfterViewInit, Component, Directive, ElementRef, HostBinding, Input, OnInit, ViewChild} from '@angular/core';

export interface TabType {
  label: string;
  data?: string;
  id?: string;
}

@Component({
  selector: 'lib-tab-group',
  template: `<div class="tab-group">
    <div class="group-header" #buttons>
      <button *ngFor="let tab of tabs" (click)="changeTab(tab)" [ngClass]="{'tab-chosen' : chosen === tab.id}">{{tab.label}}</button>
    </div>
    <div class="group-content" #tabContent>{{data}}<ng-content></ng-content></div>
  </div>`,
  styleUrls: ['./tab-group.component.scss']
})
export class TabGroupComponent implements AfterViewInit {

  @Input() tabs: TabType[];
  data;
  @ViewChild('tabContent') tabElements: ElementRef<HTMLDivElement>;
  @ViewChild('buttons') buttonElements: ElementRef<HTMLDivElement>;
  get tabsEl(): NodeListOf<HTMLElement> {
    return this.tabElements.nativeElement.querySelectorAll('lib-tab');
  }
  chosen: string = '0';

  constructor() { }

  ngAfterViewInit(): void {
    let i = 0;
    if (!this.tabs) {
      this.tabs = [];
    }
    this.tabsEl.forEach(e => {
      if (!e.classList.contains('tab-content')) {
        e.classList.add('tab-content');
      }
      this.tabs.push({label: e.attributes.getNamedItem('label').value, id: i + ''});
      const id = document.createAttribute('id');
      id.value = i++ + '';
      e.attributes.setNamedItem(id);
      if (i > 1) {
        e.hidden = true;
      }
    });
  }

  changeTab(tab: TabType): void {
    this.chosen = tab.id;
    if (tab.data) {
      this.data = tab.data;
    } else {
      this.tabsEl.forEach(e => {
        e.hidden = e.attributes.getNamedItem('id').value !== tab.id;
      });
    }
  }

}

@Directive({
  selector: 'lib-tab'
})
export class TabDirective {
  @HostBinding() class = 'tab-content';
  @Input() label;
  @Input() id;
}
