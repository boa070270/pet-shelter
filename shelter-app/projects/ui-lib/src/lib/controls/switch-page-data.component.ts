import {Component, Input, OnInit, Self, SkipSelf} from '@angular/core';
import {RootPageService} from '../shared/root-page.service';

@Component({
  selector: 'switch-page-data',
  template: '<ng-content></ng-content>',
  providers: [
    {provide: RootPageService, useClass: RootPageService}
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
  constructor(@Self() private root: RootPageService, @SkipSelf() parent: RootPageService) { }
  private setData(): void {
    if (this._data && this._prefix) {
      Object.keys(this.data || {}).forEach(k => {
        const key = (this.prefix ? this.prefix : '') + k;
        this.root.setData(key, this.data[k]);
      });
    }
  }
}
