import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {SystemLang} from '../i18n';
import {I18NType, ScrollEvent, ScrollEventService} from '../shared';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-app-bar',
  template: `<div [ngStyle]="style"><ng-content></ng-content></div>`,
  styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input('position') barPosition: 'Up' | 'Down';
  @Input('sticky') asSticky: boolean;
  private readonly scrollSubs: Subscription;
  style: any = {display: 'block', margin: 0, padding: 0, height: '3em', 'z-index': 1000, position: 'relative'};
  private direction: string;
  private position: string;
  private stick = 0;
  private slide = 0;
  private initTop: any;
  constructor(public systemLang: SystemLang, protected scrollService: ScrollEventService,
              protected changeDetector: ChangeDetectorRef, protected element: ElementRef,
              @Optional() @Inject('i18NCfg') public i18NCfg?: I18NType) {
    super(systemLang, i18NCfg);
    this.scrollSubs = scrollService.eventEmitter.subscribe((se) => this.onScrollEvent(se));
  }

  ngOnInit(): void {
    this.initTop = this.element.nativeElement.getBoundingClientRect().top;
    this.changeStyle();
  }
  getPosition(): string {
    if (this.asSticky && this.initTop > this.scrollService.pageYOffset) {
      return 'sticky';
    }
    return 'fixed';
  }
  changeStyle(): void {
    if (this.barPosition === 'Up') {
      this.style.top = `-${this.slide}px`;
      this.style.position = this.position;
    } else {
      this.style.bottom = `-${this.slide}px`;
      this.style.position = 'fixed';
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.scrollSubs.unsubscribe();
  }
  detectChanges(slide: number, position = this.getPosition()): void {
    let update;
    if (this.position !== position) {
      update = true;
      this.position = position;
    }
    if (slide !== this.slide) {
      if (this.slide < 100 || slide < 100) {
        update = true;
      }
      this.slide = slide;
    }
    if (update) {
      this.changeStyle();
      this.changeDetector.detectChanges();
    }
  }
  protected onScrollEvent(se: ScrollEvent): void {
    let slide = 0;
    if (se.direction !== this.direction) {
      this.direction = se.direction;
    } else if (se.direction !== this.barPosition) {
      if (this.slide === 0) {
        this.stick = se.pageYOffset;
        slide = 1;
      } else {
        slide = Math.abs(se.pageYOffset - this.stick);
      }
    }
    this.detectChanges(slide);
  }
}
