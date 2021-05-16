import {Component, Inject, Input, Self, SkipSelf} from '@angular/core';
import {ROOT_PAGE_DATA, RootPageService, RootPageServiceImpl} from '../shared';

@Component({
  selector: 'switch-page-data',
  template: '<ng-content></ng-content>',
  providers: [
    {provide: ROOT_PAGE_DATA, useClass: RootPageServiceImpl}
  ]
})
export class SwitchPageDataComponent {
  _data: any;
  @Input() set data(d: any) {
    this._data = d;
    this.setData();
  }
  _prefix: string;
  @Input() set prefix(p: string) {
    this._prefix = p;
    this.setData();
  }
  constructor(@Self() @Inject(ROOT_PAGE_DATA) private root: RootPageService, @SkipSelf() @Inject(ROOT_PAGE_DATA) parent: RootPageService) { }
  private setData(): void {
    if (this._data && this._prefix) {
      Object.keys(this.data || {}).forEach(k => {
        const key = (this.prefix ? this.prefix : '') + k;
        this.root.setData(key, this.data[k]);
      });
    }
  }
}
