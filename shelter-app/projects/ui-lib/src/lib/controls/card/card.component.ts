import {ChangeDetectionStrategy, Component, Directive, HostBinding, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'lib-card',
  exportAs: 'libCard',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @HostBinding() class = 'lib-card lib-focus-indicator';
}

@Component({
  selector: 'lib-card-header',
  templateUrl: 'card-header.html', // TODO ???
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent {
  @HostBinding() class = 'lib-card-header';
}

@Directive({
  selector: 'lib-card-title',
})
export class CardTitleDirective {
  @HostBinding() class = 'lib-card-title';
}

@Directive({
  selector: 'lib-card-subtitle',
})
export class CardSubtitleDirective {
  @HostBinding() class = 'lib-card-subtitle';
}

@Component({
  selector: 'lib-card-content',
  templateUrl: 'card-header.html', // TODO ???
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContentComponent {
  @HostBinding() class = 'lib-card-content';
}

@Directive({
  selector: 'lib-card-footer',
})
export class CardFooterDirective {
  @HostBinding() class = 'lib-card-footer';
}
