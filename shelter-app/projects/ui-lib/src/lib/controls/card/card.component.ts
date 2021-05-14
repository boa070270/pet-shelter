import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostBinding, Input, OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

interface CardProportions {
  header: { percentage?: number, fixed?: number };
  content: { percentage?: number, fixed?: number };
  actions: { percentage?: number, fixed?: number };
  footer: { percentage?: number, fixed?: number };
}

@Component({
  selector: 'lib-card',
  exportAs: 'libCard',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements AfterViewInit {

  @HostBinding() class = 'card'; // lib-focus-indicator
  @Input() limitByHeight: boolean;
  private _proportions: CardProportions = {header: {percentage: 35}, content: {percentage: 45},
    actions: {fixed: 26}, footer: {percentage: 20}};
  @Input()
  set proportions(p: CardProportions) {
    this._proportions = p;
  }
  get props(): CardProportions {
    const p = {header: null, content: null, actions: null, footer: null};
    Object.keys(p).forEach(k => {
      if (this[k].nativeElement.children.length > 0) {
        p[k] = this._proportions[k];
      }
    });
    return p;
  }
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('content') content: ElementRef<HTMLDivElement>;
  @ViewChild('actions') actions: ElementRef<HTMLDivElement>;
  @ViewChild('footer') footer: ElementRef<HTMLDivElement>;
  @ViewChild('self') self: ElementRef<HTMLDivElement>;

  sum(obj, type): number {
    let sum = 0;
    Object.values(obj).forEach(v => {
      if (v && v[type]) {
        sum += v[type];
      }
    });
    return sum;
  }
  ngAfterViewInit(): void {
    if (this.limitByHeight) {
      const props = this.props;
      const height = this.self.nativeElement.offsetParent.clientHeight - this.sum(props, 'fixed');
      const sum = this.sum(props, 'percentage');
      Object.keys(props).forEach(k => {
        if (props[k]) {
          if (props[k].percentage) {
            this[k].nativeElement.style.maxHeight = height * (props[k].percentage / sum) + 'px';
          }
          if (props[k].fixed) {
            this[k].nativeElement.style.maxHeight = props[k].fixed + 'px';
          }
        }
      });
      (this.content.nativeElement.firstElementChild as HTMLElement).style.height = this.content.nativeElement.style.maxHeight;
    }
    this.self.nativeElement.querySelectorAll('lib-card-content').forEach(e => {
      if (!e.classList.contains('card-content')) {
        e.classList.add('card-content');
      }
    });
    this.self.nativeElement.querySelectorAll('lib-card-footer').forEach(e => {
      if (!e.classList.contains('card-footer')) {
        e.classList.add('card-footer');
      }
    });
    this.self.nativeElement.querySelectorAll('lib-card-title').forEach(e => {
      if (!e.classList.contains('card-title')) {
        e.classList.add('card-title');
      }
    });
    this.self.nativeElement.querySelectorAll('lib-card-subtitle').forEach(e => {
      if (!e.classList.contains('card-subtitle')) {
        e.classList.add('card-subtitle');
      }
    });
    this.self.nativeElement.querySelectorAll('.libCardImg').forEach(e => {
      if (!e.classList.contains('card-img')) {
        e.classList.add('card-img');
      }
    });
  }
}

@Component({
  selector: 'lib-card-header',
  template: `
    <div>
      <lib-card-title *ngIf="title">{{title}}</lib-card-title>
      <lib-card-subtitle *ngIf="subtitle">{{subtitle}}</lib-card-subtitle>
      <ng-content select="lib-card-title, lib-card-subtitle"></ng-content>
    </div>
    <ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent {
  @HostBinding() class = 'card-header';
  @Input() title: string;
  @Input() subtitle: string;
}

@Directive({
  selector: 'lib-card-title',
})
export class CardTitleDirective {
  @HostBinding() class = 'card-title';
}

@Directive({
  selector: 'lib-card-subtitle',
})
export class CardSubtitleDirective {
  @HostBinding() class = 'card-subtitle';
}

@Directive({
  selector: 'lib-card-content'
})
export class CardContentDirective {
  @HostBinding() class = 'card-content';
}

@Directive({
  selector: 'lib-card-footer'
})
export class CardFooterDirective {
  @HostBinding() class = 'card-footer';
}

@Directive({
  selector: '[libCardImg]'
})
export class CardImageDirective {
  @HostBinding() class = 'card-img';
}
