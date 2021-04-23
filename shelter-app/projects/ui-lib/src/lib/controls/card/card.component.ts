import {ChangeDetectionStrategy, Component, Directive, ElementRef, HostBinding, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'lib-card',
  exportAs: 'libCard',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @HostBinding() class = 'card'; // lib-focus-indicator
}

@Component({
  selector: 'lib-card-header',
  template: `
    <div class="lib-card-header-text">
      <ng-content select="lib-card-title, lib-card-subtitle"></ng-content>
    </div>
    <ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent {
  @HostBinding() class = 'card-header';
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
  selector: 'lib-card-content',
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
  selector: '[libCardImg], lib-card-img'
})
export class CardImageDirective {
  @HostBinding() class = 'card-img';
}
