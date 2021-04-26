import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostBinding, Input,
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
  _proportions: CardProportions = {header: {percentage: 20}, content: {percentage: 40}, actions: {fixed: 26}, footer: {percentage: 30}};
  // header, content, actions, footer
  @Input()
  set proportions(p: CardProportions) {
    this._proportions = p;
  }
  get props(): CardProportions {
    const p = {header: null, content: null, actions: null, footer: null};
    if (this.isHeader) {
      p.header = this._proportions.header;
    }
    if (this.isContent) {
      p.content = this._proportions.content;
    }
    if (this.isActions) {
      p.actions = this._proportions.actions;
    }
    if (this.isFooter) {
      p.footer = this._proportions.footer;
    }
    return p;
  }
  get sumPer(): number {
    let sum = 0;
    Object.values(this.props).forEach(v => {
      if (v && v.percentage) {
        sum += v.percentage;
      }
    });
    return sum;
  }
  get sumFix(): number {
    let sum = 0;
    Object.values(this.props).forEach(v => {
      if (v && v.fixed) {
        sum += v.fixed;
      }
    });
    return sum;
  }
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  get isHeader(): boolean {
    return this.header.nativeElement.children.length > 0;
  }
  @ViewChild('content') content: ElementRef<HTMLDivElement>;
  get isContent(): boolean {
    return this.content.nativeElement.children.length > 0;
  }
  @ViewChild('actions') actions: ElementRef<HTMLDivElement>;
  get isActions(): boolean {
    return this.actions.nativeElement.children.length > 0;
  }
  @ViewChild('footer') footer: ElementRef<HTMLDivElement>;
  get isFooter(): boolean {
    return this.footer.nativeElement.children.length > 0;
  }
  @ViewChild('self') self: ElementRef<HTMLDivElement>;
  ngAfterViewInit(): void {
    if (this.limitByHeight) {
      const height = this.self.nativeElement.offsetParent.clientHeight - this.sumFix;
      const sum = this.sumPer;
      const props = this.props;
      Object.keys(props).forEach(k => {
        if (props[k] && props[k].percentage) {
          this[k].nativeElement.style.maxHeight = height * (props[k].percentage / sum) + 'px';
        }
        if (props[k] && props[k].fixed) {
          this[k].nativeElement.style.maxHeight = props[k].fixed + 'px';
        }
      });
      (this.content.nativeElement.firstElementChild as HTMLElement).style.height = this.content.nativeElement.style.maxHeight;
    }
  }
}

@Component({
  selector: 'lib-card-header',
  template: `
    <div>
      <ng-content select="lib-card-title, lib-card-subtitle"></ng-content>
    </div>
<!--    <div #imageDiv class="card-img-overlay">-->
<!--        <ng-content select="img, libCardImg"></ng-content>-->
<!--    </div>-->
    <ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent implements AfterViewInit {
  @HostBinding() class = 'card-header';
  @ViewChild('imageDiv') imageDiv: ElementRef<HTMLDivElement>;
  ngAfterViewInit(): void {
    if (this.imageDiv) {
      // console.log(this.imageDiv.nativeElement.offsetHeight);
      // console.log(this.imageDiv.nativeElement.offsetWidth);
    }
  }
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
  @HostBinding() class = 'card-body';
}

@Directive({
  selector: 'lib-card-footer',
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

@Component({
  selector: 'lib-card-img',
  template: `
    <div #imageDiv class="card-img-overlay">
        <ng-content select="img"></ng-content>
    </div>
    <ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardImageComponent implements AfterViewInit {
  @ViewChild('imageDiv') imageDiv: ElementRef<HTMLDivElement>;
  @ViewChild(Image) image: ElementRef<HTMLDivElement>;
  ngAfterViewInit(): void {
    if (this.imageDiv) {
      // console.log(this.imageDiv.nativeElement.offsetHeight);
      // console.log(this.imageDiv.nativeElement.offsetWidth);
    }
    if (this.image) {
      console.log('AAAAAAAAAAAAAAAAAAAAA');
    }
  }
}
