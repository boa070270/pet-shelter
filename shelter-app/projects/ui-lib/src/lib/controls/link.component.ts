import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'lib-link',
  template: `<div (click)="onCLick()" class="link-container">
    <img src="{{icoUri}}" class="ico-class" *ngIf="icoUri">
    <i [ngClass]="classes" *ngIf="faIcon"></i>
    <div class="content">
      <ng-content></ng-content>
    </div>
  </div>`,
  styles: [
    '.link-container {display: flex;flex-direction: row;align-items: center;}',
    '.link-container:hover {cursor: pointer;}',
    '.content {display: block; margin: 2px;}',
    '.fnt-class {margin: 2px;}',
    '.ico-class {max-width: 1em; max-height: 1em; width: auto; height: auto; margin: 2px;}'
  ]
})
export class LinkComponent implements OnInit {
  @Input() href: string;
  @Input() faIcon: string;
  icoUri: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (!this.faIcon) {
      if (this.href.startsWith('tel:')) {
        this.faIcon = 'phone';
      } else if (this.href.startsWith('mailto:')) {
        this.faIcon = 'envelope';
      } else if (this.href.startsWith('http:') || this.href.startsWith('https:') ){
        const url = new URL(this.href);
        this.icoUri = url.protocol + '//' + url.host + '/favicon.ico';
      }
    }
  }
  get classes(): any {
    const cssClasses = {
      fa: true,
      'fnt-class': true,
    };
    cssClasses['fa-' + this.faIcon] = true;
    return cssClasses;
  }
  onCLick(): void {
    if (this.href.startsWith('/')) {
      this.router.navigate([this.href]);
    } else {
      window.open(this.href, '_blank');
    }
  }
}
